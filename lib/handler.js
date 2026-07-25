import { sendText, sendImage, markAsRead } from './whatsapp.js';
import { chatAgent, analyzeImage } from './ai.js';
import { loadSession, saveSession } from './sessions.js';
import { getConfig } from './config.js';
import { getDb } from './db.js';

// Categories whose products are installed on a door → door thickness matters.
const DOOR_LOCK_CATEGORIES = new Set(['smart-door-locks', 'digital-door-locks']);

async function getOwnerPhone(client) {
  return await getConfig('owner_phone', client.ownerPhone);
}

async function logMessage(phone, role, message) {
  if (!message) return;
  try {
    const db = getDb();
    await db.query(
      'INSERT INTO messages (phone, role, message) VALUES ($1, $2, $3)',
      [phone, role, String(message).slice(0, 4000)]
    );
  } catch (e) {
    console.warn('logMessage error:', e.message);
  }
}

async function upsertCustomer(phone, session) {
  try {
    const db = getDb();
    await db.query(`
      INSERT INTO customers (phone, name, product_interest, booked, last_seen, message_count)
      VALUES ($1, $2, $3, $4, NOW(), 1)
      ON CONFLICT (phone) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, customers.name),
        product_interest = COALESCE(EXCLUDED.product_interest, customers.product_interest),
        booked = GREATEST(customers.booked, EXCLUDED.booked),
        last_seen = NOW(),
        message_count = customers.message_count + 1
    `, [
      phone,
      session.data?.name || session.name || null,
      session.lastProduct || null,
      session.bookedAppointment || false,
    ]);
  } catch (e) {
    console.warn('upsertCustomer error:', e.message);
  }
}

// Keep the last 12 turns so the AI has memory without blowing the token budget.
function addToHistory(session, role, text) {
  if (!text) return;
  if (!session.conversationHistory) session.conversationHistory = [];
  session.conversationHistory.push({ role, text });
  if (session.conversationHistory.length > 12) {
    session.conversationHistory = session.conversationHistory.slice(-12);
  }
}

// Is this product (matched by name/code) a door lock → so we ask for a door photo?
// Unknown product on a booking → assume yes (installations are door locks by default).
function isDoorLockProduct(productName, categories) {
  if (!productName) return true;
  const q = String(productName).toLowerCase().trim();
  for (const cat of categories) {
    for (const p of cat.products) {
      if (p.name.toLowerCase() === q || (p.code || '').toLowerCase() === q) {
        return DOOR_LOCK_CATEGORIES.has(cat.id);
      }
    }
  }
  for (const cat of categories) {
    for (const p of cat.products) {
      const name = p.name.toLowerCase();
      if (q.includes(name) || name.includes(q)) {
        return DOOR_LOCK_CATEGORIES.has(cat.id);
      }
    }
  }
  return true;
}

// Every customer-facing message is sent through here so it's also logged.
async function botReply(client, to, text) {
  if (!text) return;
  await sendText(client.phoneNumberId, client.accessToken, to, text);
  await logMessage(to, 'bot', text);
}

// ── Owner notifications (internal, structured on purpose) ─────────────────────

async function notifyOwnerBooking(client, from, data) {
  const ownerPhone = await getOwnerPhone(client);
  if (!ownerPhone) return;

  const lines = [
    '🔔 *New Appointment Request*',
    '',
    `From: wa.me/${from}`,
    `Name: ${data.name || '—'}`,
    `Phone: ${data.phone || '—'}`,
    `Location: ${data.location || '—'}`,
    `Preferred Date: ${data.date || '—'}`,
  ];
  if (data.product) lines.push(`Product: ${data.product}`);
  if (data.doorThickness) lines.push(`Door thickness: ${data.doorThickness}`);
  else if (data.hasDoorPhoto) lines.push('Door thickness: 📷 see door photo below');

  await sendText(client.phoneNumberId, client.accessToken, ownerPhone, lines.join('\n'));

  if (data.hasDoorPhoto && data.doorPhotoId) {
    await sendImage(client.phoneNumberId, client.accessToken, ownerPhone, data.doorPhotoId,
      `📷 Door photo — ${data.name || from}${data.phone ? ` (${data.phone})` : ''}`);
  }
}

async function notifyOwnerService(client, from, data) {
  const ownerPhone = await getOwnerPhone(client);
  if (!ownerPhone) return;

  const lines = [
    '🚨 *New Service Request*',
    '',
    `From: wa.me/${from}`,
    `Name: ${data.name || '—'}`,
    `Phone: ${data.phone || '—'}`,
    `Location: ${data.location || '—'}`,
    `Preferred Date: ${data.date || '—'}`,
    `Issue: ${data.issue || 'Not specified'}`,
  ];

  await sendText(client.phoneNumberId, client.accessToken, ownerPhone, lines.join('\n'));

  if (data.hasImage && data.imageId) {
    await sendImage(client.phoneNumberId, client.accessToken, ownerPhone, data.imageId,
      `📷 Photo — ${data.name || from}${data.phone ? ` (${data.phone})` : ''} · ${data.issue || ''}`);
  }
}

// ── Core ──────────────────────────────────────────────────────────────────────

export async function handleMessage(message, client) {
  const { phoneNumberId, accessToken } = client;
  const from = message.from;

  markAsRead(phoneNumberId, accessToken, message.id);

  const incomingText = message.text?.body || message.image?.caption || `[${message.type}]`;
  await logMessage(from, 'customer', incomingText);

  const session = await loadSession(from);
  session.clientId = phoneNumberId;
  session.hasInteracted = true;

  try {
    if (message.type === 'image') {
      await handleImage(message, client, session, from);
      return;
    }

    // Pull plain text out of text or (legacy/admin) interactive replies.
    let text = '';
    if (message.type === 'text') {
      text = message.text.body.trim();
    } else if (message.type === 'interactive') {
      text = message.interactive?.button_reply?.title
        || message.interactive?.list_reply?.title
        || message.interactive?.button_reply?.id
        || message.interactive?.list_reply?.id
        || '';
    }

    if (!text) {
      // Non-text, non-image (audio, location, etc.) — let Priya respond naturally.
      text = `[the customer sent a ${message.type}]`;
    }

    await runConversation(text, client, session, from);
  } catch (err) {
    console.error('handleMessage error:', err);
  } finally {
    try {
      await saveSession(from, session);
      await upsertCustomer(from, session);
    } catch (err) {
      console.error('saveSession error:', err);
    }
  }
}

// One AI turn: send the message to Priya, apply what she extracted, reply,
// and finalize the lead if she's done collecting.
async function runConversation(text, client, session, from) {
  if (!session.data) session.data = {};

  const isDoorLock = session.flowType === 'booking'
    ? isDoorLockProduct(session.data.product || session.lastProduct, client.products)
    : false;

  const result = await chatAgent(text, client, session, { isDoorLock });

  if (!result) {
    // Only reached if Gemini is fully unavailable — minimal graceful fallback.
    await botReply(client, from, `Sorry, I missed that — could you say it once more? 😊`);
    return;
  }

  // Discount only ever escalates.
  if (result.discountStage > (session.discountStage || 0)) {
    session.discountStage = result.discountStage;
  }

  // Track product of interest.
  if (result.product) {
    session.lastProduct = result.product;
    session.data.product = result.product;
  }

  // Flow / intent.
  if (result.intent === 'booking') {
    session.flowType = 'booking';
  } else if (result.intent === 'service') {
    session.flowType = 'service';
    if (result.issue && !session.data.issue) session.data.issue = result.issue;
  }

  // Merge collected details (never blank out what we already had).
  for (const k of ['name', 'phone', 'location', 'date', 'doorThickness']) {
    if (result.data[k]) session.data[k] = result.data[k];
  }
  if (session.data.name && !session.name) session.name = session.data.name;

  if (result.askingForPhoto) session.awaitingDoorPhoto = true;

  // Customer asked to be contacted later → schedule a template follow-up for that day.
  if (result.followUpDays) {
    session.followUpAt = Date.now() + result.followUpDays * 24 * 60 * 60 * 1000;
    session.scheduledFollowUpSent = false;
  }

  addToHistory(session, 'user', text);
  addToHistory(session, 'priya', result.reply);

  await botReply(client, from, result.reply);

  if (result.readyToFinalize && session.flowType) {
    await finalizeLead(client, session, from);
  }
}

// Notify the owner and close out the lead — but only once we truly have what we need.
async function finalizeLead(client, session, from) {
  const d = session.data || {};
  const hasBasics = d.name && d.phone && d.location && d.date;
  if (!hasBasics) return; // never raise a half-empty lead to the owner

  if (session.flowType === 'service') {
    await notifyOwnerService(client, from, d);
  } else {
    // The door photo is optional — Priya asks for it, but a customer may decline,
    // and she finalizes either way. Whatever photo arrived is forwarded to the owner.
    await notifyOwnerBooking(client, from, d);
  }

  session.bookedAppointment = true;
  session.followedUp = true;
  session.flowType = null;
  session.awaitingDoorPhoto = false;
  session.followUpAt = null; // booked — no need to chase
  session.data = {};
}

// ── Images ──────────────────────────────────────────────────────────────────

async function handleImage(message, client, session, from) {
  const { accessToken } = client;
  const imageId = message.image.id;
  const caption = message.image.caption || '';

  // If Priya asked for a door photo during a booking, this image IS that photo.
  if (session.flowType === 'booking' && session.awaitingDoorPhoto) {
    if (!session.data) session.data = {};
    session.data.hasDoorPhoto = true;
    session.data.doorPhotoId = imageId;
    session.awaitingDoorPhoto = false;
    // Route a synthetic turn so Priya acknowledges and wraps up naturally.
    await runConversation('[the customer just sent a photo of their door]', client, session, from);
    return;
  }

  // Otherwise, let Gemini vision look at it.
  const imageUrl = await getMediaUrl(imageId, accessToken);
  let aiResult = null;
  if (imageUrl) {
    const imageData = await downloadMedia(imageUrl, accessToken);
    if (imageData) {
      aiResult = await analyzeImage(imageData.buffer, imageData.mimeType, caption, client);
    }
  }

  if (aiResult) {
    if (aiResult.type === 'service') {
      session.flowType = 'service';
      if (!session.data) session.data = {};
      session.data.issue = aiResult.summary;
      session.data.hasImage = true;
      session.data.imageId = imageId;
    }
    addToHistory(session, 'user', caption ? `[photo] ${caption}` : '[sent a photo]');
    addToHistory(session, 'priya', aiResult.message);
    await botReply(client, from, aiResult.message);
    return;
  }

  // Vision unavailable — hand the moment to the text agent.
  await runConversation(caption || '[the customer sent a photo]', client, session, from);
}

// ── WhatsApp media helpers ────────────────────────────────────────────────────

async function getMediaUrl(mediaId, accessToken) {
  try {
    const res = await fetch(`https://graph.facebook.com/v22.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url || null;
  } catch {
    return null;
  }
}

async function downloadMedia(url, accessToken) {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') || 'image/jpeg';
    return { buffer, mimeType };
  } catch {
    return null;
  }
}
