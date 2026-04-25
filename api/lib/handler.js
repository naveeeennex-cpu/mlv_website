import { sendText, sendInteractiveButtons, sendImage, markAsRead } from './whatsapp.js';
import { askAI, analyzeImage, extractDetails } from './ai.js';

// In-memory session store (resets on cold start — fine for stateless flows)
const sessions = new Map();

function getSession(from) {
  if (!sessions.has(from)) {
    sessions.set(from, { state: 'idle', lastProduct: null, data: {} });
  }
  return sessions.get(from);
}

const GREETINGS = ['hi', 'hello', 'hey', 'hola', 'start', 'menu', 'help', 'hai', 'hii'];

const RESERVED_NAME_WORDS = new Set([
  'yes', 'yess', 'no', 'nope', 'yeah', 'yep', 'ok', 'okay', 'sure', 'thanks',
  'thank you', 'cancel', 'stop', 'hi', 'hello', 'hey', 'menu', 'start', 'help',
  'confirm', 'done', 'k', 'kk',
]);

function isPlausibleName(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 2 || trimmed.length > 80) return false;
  if (/^\d+$/.test(trimmed)) return false;
  if (RESERVED_NAME_WORDS.has(trimmed.toLowerCase())) return false;
  return true;
}

function isPlausiblePhone(text) {
  if (!text) return false;
  const digits = text.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

async function finalizeBooking(phoneNumberId, accessToken, from, data, client) {
  const productInfo = data.product ? `\nProduct: ${data.product}` : '';
  const summary = `✅ *Booking Confirmed!*\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Location: ${data.location}\n` +
    `Preferred Date: ${data.date}${productInfo}\n\n` +
    `Our team will contact you shortly to confirm. You can also reach us at +${client.ownerPhone}`;

  await sendText(phoneNumberId, accessToken, from, summary);

  if (client.ownerPhone) {
    const ownerMsg = `🔔 *New Booking Request*\n\n` +
      `From: wa.me/${from}\n` +
      `Name: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Location: ${data.location}\n` +
      `Date: ${data.date}${productInfo}`;
    await sendText(phoneNumberId, accessToken, client.ownerPhone, ownerMsg);
  }
}

async function finalizeService(phoneNumberId, accessToken, from, data, client) {
  const issue = data.issue || 'Not specified';
  const hasImage = data.hasImage ? '\n📷 Image attached' : '';
  const summary = `✅ *Service Request Registered!*\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Location: ${data.location}\n` +
    `Preferred Date: ${data.date}\n` +
    `Issue: ${issue}${hasImage}\n\n` +
    `Our technician will contact you to confirm the visit. For urgent help, call +${client.ownerPhone}`;

  await sendText(phoneNumberId, accessToken, from, summary);

  if (client.ownerPhone) {
    const ownerMsg = `🚨 *New Service/Complaint Request*\n\n` +
      `From: wa.me/${from}\n` +
      `Name: ${data.name}\n` +
      `Phone: ${data.phone}\n` +
      `Location: ${data.location}\n` +
      `Date: ${data.date}\n` +
      `Issue: ${issue}${hasImage}`;
    await sendText(phoneNumberId, accessToken, client.ownerPhone, ownerMsg);

    if (data.hasImage && data.imageId) {
      await sendImage(phoneNumberId, accessToken, client.ownerPhone, data.imageId,
        `📷 Image from ${data.name} (${data.phone}) - ${issue}`);
    }
  }
}

function nextLegacyState(flowType, data) {
  const prefix = flowType === 'service' ? 'service' : 'booking';
  if (!data.name) return `${prefix}_name`;
  if (!data.phone) return `${prefix}_phone`;
  if (!data.location) return `${prefix}_location`;
  if (!data.date) return `${prefix}_date`;
  return null;
}

function legacyPrompt(flowType, data) {
  if (!data.name) return `Please share your *full name*:`;
  if (!data.phone) return `📱 Please share your *phone number*:`;
  if (!data.location) return `📍 Please share your *location/city*:`;
  if (!data.date) {
    return flowType === 'service'
      ? `📅 When would be a good time for our technician to visit? (e.g., "Tomorrow 10AM", "Next Monday")`
      : `📅 When would you prefer? (e.g., "Next Monday", "15 April")`;
  }
  return '';
}

async function fallbackToLegacy(phoneNumberId, accessToken, from, session, client, reason) {
  const flowType = session.flowType || 'booking';
  const next = nextLegacyState(flowType, session.data);
  if (!next) {
    // All fields collected — finalize directly
    if (flowType === 'service') {
      await finalizeService(phoneNumberId, accessToken, from, session.data, client);
    } else {
      await finalizeBooking(phoneNumberId, accessToken, from, session.data, client);
    }
    session.state = 'idle';
    session.data = {};
    return;
  }
  session.state = next;
  if (reason) console.warn(`AI flow falling back to legacy (${reason})`);
  await sendText(phoneNumberId, accessToken, from, legacyPrompt(flowType, session.data));
}

export async function handleMessage(message, client) {
  const { phoneNumberId, accessToken } = client;
  const from = message.from;
  const msgId = message.id;

  // Mark as read
  markAsRead(phoneNumberId, accessToken, msgId);

  // Handle image messages
  if (message.type === 'image') {
    const imageId = message.image.id;
    const caption = message.image.caption || '';
    const session = getSession(from);

    // If in complaint flow and waiting for image, attach it
    if (session.state === 'complaint_details') {
      session.data.hasImage = true;
      session.data.imageId = imageId;
    }

    // Download image and analyze with Gemini
    const imageUrl = await getMediaUrl(imageId, accessToken);
    if (imageUrl) {
      const imageData = await downloadMedia(imageUrl, accessToken);
      if (imageData) {
        const aiResult = await analyzeImage(imageData.buffer, imageData.mimeType, caption, client);
        if (aiResult) {
          if (aiResult.type === 'service') {
            session.flowType = 'service';
            session.state = 'ai_collecting';
            session.data = { issue: aiResult.summary, hasImage: true, imageId };
            await sendText(phoneNumberId, accessToken, from,
              `${aiResult.message}\n\nLet me help you raise a service request. 📝\n\nPlease share your *full name*:`);
            return;
          }
          await sendText(phoneNumberId, accessToken, from, aiResult.message || aiResult);
          return;
        }
      }
    }

    await sendText(phoneNumberId, accessToken, from,
      `Thanks for sharing the image! Could you also describe the issue in text so I can assist you better?`);
    return;
  }

  // Extract text
  let text = '';
  if (message.type === 'text') {
    text = message.text.body.trim();
  } else if (message.type === 'interactive') {
    if (message.interactive.type === 'button_reply') {
      text = message.interactive.button_reply.id;
    } else if (message.interactive.type === 'list_reply') {
      text = message.interactive.list_reply.id;
    }
  } else {
    await sendText(phoneNumberId, accessToken, from,
      `Thanks for your message! I can help you with text messages and images. Please type your query or say "hi" to see the menu.`);
    return;
  }

  const lower = text.toLowerCase();
  const session = getSession(from);

  // ── AI-DRIVEN COLLECTION (preferred path) ──
  if (session.state === 'ai_collecting') {
    // Allow user to bail out
    if (GREETINGS.includes(lower) || lower === 'cancel' || lower === 'stop') {
      session.state = 'idle';
      session.data = {};
      session.flowType = null;
      await sendGreeting(phoneNumberId, accessToken, from, client);
      return;
    }

    const result = await extractDetails(session.flowType, session.data, text, client);

    if (!result) {
      // AI unavailable or errored — degrade to rigid flow with whatever we have
      await fallbackToLegacy(phoneNumberId, accessToken, from, session, client, 'extractDetails returned null');
      return;
    }

    // Merge extracted fields, preserving non-data session keys (product, issue, hasImage, imageId)
    const merged = { ...session.data };
    for (const k of ['name', 'phone', 'location', 'date']) {
      if (result.data[k] && result.data[k] !== 'null') merged[k] = result.data[k];
    }
    session.data = merged;

    // Final confirmation
    if (result.confirmed && session.data.name && session.data.phone &&
        session.data.location && session.data.date) {
      if (session.flowType === 'service') {
        await finalizeService(phoneNumberId, accessToken, from, session.data, client);
      } else {
        await finalizeBooking(phoneNumberId, accessToken, from, session.data, client);
      }
      session.state = 'idle';
      session.data = {};
      session.flowType = null;
      return;
    }

    await sendText(phoneNumberId, accessToken, from, result.reply);
    return;
  }

  // ── LEGACY BOOKING FLOW (fallback when AI unavailable) ──
  if (session.state === 'booking_name') {
    if (!isPlausibleName(text)) {
      await sendText(phoneNumberId, accessToken, from,
        `That doesn't look like a name. Please share your *full name* (e.g., "Naveen Kumar"):`);
      return;
    }
    session.data.name = text;
    session.state = 'booking_phone';
    await sendText(phoneNumberId, accessToken, from, `Thanks ${text}! 📱 Please share your *phone number*:`);
    return;
  }
  if (session.state === 'booking_phone') {
    if (!isPlausiblePhone(text)) {
      await sendText(phoneNumberId, accessToken, from,
        `Please share a valid *phone number* with at least 10 digits:`);
      return;
    }
    session.data.phone = text.replace(/\D/g, '');
    session.state = 'booking_location';
    await sendText(phoneNumberId, accessToken, from, `Got it! 📍 Please share your *location/city*:`);
    return;
  }
  if (session.state === 'booking_location') {
    session.data.location = text;
    session.state = 'booking_date';
    await sendText(phoneNumberId, accessToken, from, `📅 When would you prefer? (e.g., "Next Monday", "15 April")`);
    return;
  }
  if (session.state === 'booking_date') {
    session.data.date = text;
    await finalizeBooking(phoneNumberId, accessToken, from, session.data, client);
    session.state = 'idle';
    session.data = {};
    return;
  }

  // ── LEGACY SERVICE / COMPLAINT FLOW (fallback when AI unavailable) ──
  if (session.state === 'service_name') {
    if (!isPlausibleName(text)) {
      await sendText(phoneNumberId, accessToken, from,
        `That doesn't look like a name. Please share your *full name*:`);
      return;
    }
    session.data.name = text;
    session.state = 'service_phone';
    await sendText(phoneNumberId, accessToken, from, `Thanks ${text}! 📱 Please share your *phone number*:`);
    return;
  }
  if (session.state === 'service_phone') {
    if (!isPlausiblePhone(text)) {
      await sendText(phoneNumberId, accessToken, from,
        `Please share a valid *phone number* with at least 10 digits:`);
      return;
    }
    session.data.phone = text.replace(/\D/g, '');
    session.state = 'service_location';
    await sendText(phoneNumberId, accessToken, from, `Got it! 📍 Please share your *location/city*:`);
    return;
  }
  if (session.state === 'service_location') {
    session.data.location = text;
    session.state = 'service_date';
    await sendText(phoneNumberId, accessToken, from, `📅 When would be a good time for our technician to visit? (e.g., "Tomorrow 10AM", "Next Monday")`);
    return;
  }
  if (session.state === 'service_date') {
    session.data.date = text;
    await finalizeService(phoneNumberId, accessToken, from, session.data, client);
    session.state = 'idle';
    session.data = {};
    return;
  }
  if (session.state === 'complaint_details') {
    session.data.issue = text;
    // Try AI-driven flow first
    session.flowType = 'service';
    session.state = 'ai_collecting';
    const result = await extractDetails('service', session.data, text, client);
    if (result) {
      await sendText(phoneNumberId, accessToken, from,
        `I understand the issue. Let me raise a service request for you. 📝\n\n${result.reply}`);
      return;
    }
    // AI unavailable — use rigid flow
    session.state = 'service_name';
    await sendText(phoneNumberId, accessToken, from,
      `I understand the issue. Let me raise a service request for you. 📝\n\nPlease share your *full name*:`);
    return;
  }

  // Reset on greeting
  if (GREETINGS.includes(lower)) {
    session.state = 'idle';
    session.lastProduct = null;
    await sendGreeting(phoneNumberId, accessToken, from, client);
    return;
  }

  // ── MAIN MENU OPTIONS ──
  if (lower === '1' || lower === 'products' || lower === 'browse' || lower === 'btn_products') {
    await sendCategories(phoneNumberId, accessToken, from, client);
    return;
  }

  if (lower === '2' || lower === 'book' || lower === 'install' || lower === 'installation' || lower === 'btn_book') {
    session.flowType = 'booking';
    session.state = 'ai_collecting';
    session.data = {};
    await sendText(phoneNumberId, accessToken, from, `Great! Let's book an installation. 📝\n\nPlease share your *full name*:`);
    return;
  }

  if (lower === '3' || lower === 'talk' || lower === 'contact' || lower === 'support' || lower === 'btn_contact') {
    await sendText(phoneNumberId, accessToken, from,
      `📞 *Contact ${client.businessName}*\n\n` +
      `Phone: +${client.ownerPhone}\n` +
      `WhatsApp: wa.me/${client.ownerPhone}\n` +
      (client.websiteUrl ? `Website: ${client.websiteUrl}\n` : '') +
      `\nOur team is available Mon-Sat, 9AM-7PM.`);
    return;
  }

  // Service / complaint triggers
  if (lower === '4' || lower === 'service' || lower === 'complaint' || lower === 'repair' ||
      lower === 'issue' || lower === 'problem' || lower === 'broken' || lower === 'not working' ||
      lower === 'btn_service') {
    session.state = 'complaint_details';
    session.data = {};
    await sendText(phoneNumberId, accessToken, from,
      `🔧 *Service & Support*\n\nPlease describe your issue in detail (e.g., "lock not responding", "fingerprint not working", "battery issue").\n\nYou can also share a *photo* of the problem.`);
    return;
  }

  // Order / enquire / confirm interest about last viewed product
  const orderTriggers = ['order', 'enquire', 'buy', 'btn_order', 'okay', 'ok', 'yes', 'yeah',
    'interested', 'i want', 'i need', 'book it', 'go ahead', 'proceed', 'sure'];
  if (orderTriggers.some(t => lower === t || lower.startsWith(t)) && session.lastProduct) {
    session.flowType = 'booking';
    session.state = 'ai_collecting';
    session.data = { product: session.lastProduct };
    await sendText(phoneNumberId, accessToken, from,
      `Great choice! Let's get your order for *${session.lastProduct}* started. 📝\n\nPlease share your *full name*:`);
    return;
  }

  // ── NUMBER INPUT ──
  const num = parseInt(lower);
  if (!isNaN(num) && num >= 1) {
    if (session.state === 'browsing_category' && session.currentCategory != null) {
      const category = client.products[session.currentCategory];
      const productIndex = num - 1;
      if (category && productIndex >= 0 && productIndex < category.products.length) {
        const product = category.products[productIndex];
        session.lastProduct = product.name;
        session.state = 'idle';
        await sendProductDetails(phoneNumberId, accessToken, from, product, client);
        return;
      }
    }
    const catIndex = num - 1;
    if (catIndex >= 0 && catIndex < client.products.length) {
      session.state = 'browsing_category';
      session.currentCategory = catIndex;
      await sendCategoryProducts(phoneNumberId, accessToken, from, client, catIndex);
      return;
    }
  }

  // ── PRODUCT / CATEGORY SEARCH ──
  const product = findProduct(lower, client.products);
  if (product) {
    session.lastProduct = product.name;
    await sendProductDetails(phoneNumberId, accessToken, from, product, client);
    return;
  }

  const category = findCategory(lower, client.products);
  if (category) {
    const catIdx = client.products.indexOf(category);
    await sendCategoryProducts(phoneNumberId, accessToken, from, client, catIdx);
    return;
  }

  // ── AI FOR COMPLEX QUERIES ──
  const aiResult = await askAI(text, client);
  if (aiResult) {
    // AI detected booking intent
    if (aiResult.type === 'booking') {
      session.flowType = 'booking';
      session.state = 'ai_collecting';
      session.data = { product: aiResult.product };
      await sendText(phoneNumberId, accessToken, from,
        `Great choice! Let's get your order for *${aiResult.product}* started. 📝\n\nPlease share your *full name*:`);
      return;
    }

    // AI detected service/complaint intent
    if (aiResult.type === 'service') {
      session.flowType = 'service';
      session.state = 'ai_collecting';
      session.data = { issue: aiResult.summary };
      await sendText(phoneNumberId, accessToken, from,
        `${aiResult.message}\n\nLet me raise a service request for you. 📝\n\nPlease share your *full name*:`);
      return;
    }

    // Regular text reply
    const replyText = aiResult.message || '';
    // Extract product names mentioned by AI and save to session
    for (const cat of client.products) {
      for (const p of cat.products) {
        if (replyText.includes(p.name)) {
          session.lastProduct = p.name;
          break;
        }
      }
      if (session.lastProduct) break;
    }

    await sendText(phoneNumberId, accessToken, from, replyText);
    return;
  }

  // ── FALLBACK ──
  await sendText(phoneNumberId, accessToken, from,
    `I'm not sure I understood that. Here's what I can help with:\n\n` +
    `1️⃣ *Products* - Browse our catalog\n` +
    `2️⃣ *Book* - Schedule an installation\n` +
    `3️⃣ *Contact* - Talk to our team\n` +
    `4️⃣ *Service* - Report an issue or complaint\n\n` +
    `Or just ask any question about Yale smart locks!`);
}

// ── GREETING ──
async function sendGreeting(phoneNumberId, accessToken, to, client) {
  const greeting = `👋 *Welcome to ${client.businessName}!*\n` +
    `Your trusted Yale Smart Lock experts.\n\n` +
    `How can I help you today?\n\n` +
    `1️⃣ Browse Products\n` +
    `2️⃣ Book Installation\n` +
    `3️⃣ Talk to Us\n` +
    `4️⃣ Service & Support\n\n` +
    `_Or just type your question about any Yale product!_`;

  await sendInteractiveButtons(phoneNumberId, accessToken, to, {
    body: greeting,
    buttons: [
      { id: 'btn_products', title: 'Browse Products' },
      { id: 'btn_book', title: 'Book Installation' },
      { id: 'btn_service', title: 'Service & Support' },
    ],
  });
}

// ── CATEGORIES ──
async function sendCategories(phoneNumberId, accessToken, to, client) {
  let msg = `📦 *Product Categories*\n\n`;
  client.products.forEach((cat, i) => {
    msg += `${i + 1}. ${cat.name} (${cat.products.length})\n`;
  });
  msg += `\n_Reply with a number to browse, or type a product name to search._`;
  await sendText(phoneNumberId, accessToken, to, msg);
}

async function sendCategoryProducts(phoneNumberId, accessToken, to, client, catIndex) {
  const category = client.products[catIndex];
  if (!category) return;

  let msg = `📋 *${category.name}*\n${category.description}\n\n`;

  const products = category.products.slice(0, 10);
  products.forEach((p, i) => {
    msg += `${i + 1}. *${p.name}* — ${p.mrp}\n`;
  });

  if (category.products.length > 10) {
    msg += `\n_...and ${category.products.length - 10} more_\n`;
  }

  msg += `\n_Reply with a number or product name to see details._`;
  await sendText(phoneNumberId, accessToken, to, msg);
}

// ── PRODUCT DETAILS ──
async function sendProductDetails(phoneNumberId, accessToken, to, product, client) {
  let msg = `🔐 *${product.name}*\n`;
  if (product.code && product.code !== product.name) {
    msg += `Model: ${product.code}\n`;
  }
  msg += `💰 *Price: ${product.mrp}*\n\n`;

  if (product.features.length > 0) {
    msg += `✨ *Features:*\n`;
    product.features.forEach(f => { msg += `• ${f}\n`; });
    msg += `\n`;
  }

  if (product.specs) {
    msg += `📐 *Specs:*\n`;
    for (const [key, val] of Object.entries(product.specs)) {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      msg += `• ${label}: ${val}\n`;
    }
    msg += `\n`;
  }

  if (product.finishes && product.finishes.length > 0) {
    msg += `🎨 Finishes: ${product.finishes.join(', ')}\n`;
  }

  if (product.bundleIncludes) {
    msg += `📦 Includes: ${product.bundleIncludes}\n`;
  }

  msg += `\n_Reply *order* to enquire or *menu* to go back._`;

  await sendInteractiveButtons(phoneNumberId, accessToken, to, {
    body: msg,
    buttons: [
      { id: 'btn_order', title: 'Order / Enquire' },
      { id: 'btn_products', title: 'More Products' },
      { id: 'btn_contact', title: 'Contact Us' },
    ],
  });
}

// ── HELPERS ──
function findProduct(query, categories) {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  for (const cat of categories) {
    for (const p of cat.products) {
      const name = p.name.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const code = (p.code || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
      if (name === q || code === q) return p;
      if (q.length >= 4 && (name.includes(q) || code.includes(q))) return p;
      if (q.length >= 4 && q.includes(name)) return p;
    }
  }
  return null;
}

function findCategory(query, categories) {
  const q = query.toLowerCase().trim();

  if (/\?|which|what|how|best|recommend|suggest|can|does|should|tell me/i.test(q)) {
    return null;
  }

  if (q.split(/\s+/).length > 4) return null;

  for (const cat of categories) {
    const catName = cat.name.toLowerCase();
    if (catName.includes(q) || q.includes(catName)) return cat;
    const words = q.split(/\s+/);
    for (const word of words) {
      if (word.length >= 5 && catName.includes(word)) return cat;
    }
  }
  return null;
}

// ── MEDIA HELPERS ──
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
