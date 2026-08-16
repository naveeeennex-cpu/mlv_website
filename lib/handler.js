import { markAsRead } from './whatsapp.js';
import { loadSession, saveSession } from './sessions.js';
import { getDb } from './db.js';
import { runBotFlow, partialFields } from './botFlow.js';
import { upsertLead } from './leads.js';

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
    const b = session.bot || {};
    await db.query(`
      INSERT INTO customers (phone, name, product_interest, booked, last_seen, message_count)
      VALUES ($1, $2, $3, $4, NOW(), 1)
      ON CONFLICT (phone) DO UPDATE SET
        product_interest = COALESCE(EXCLUDED.product_interest, customers.product_interest),
        booked = GREATEST(customers.booked, EXCLUDED.booked),
        last_seen = NOW(),
        message_count = customers.message_count + 1
    `, [
      phone,
      session.name || null,
      b.selectedName || b.productName || null,
      b.step === 'done',
    ]);
  } catch (e) {
    console.warn('upsertCustomer error:', e.message);
  }
}

// ── Core ──────────────────────────────────────────────────────────────────────

export async function handleMessage(message, client) {
  const { phoneNumberId, accessToken } = client;
  const from = message.from;

  markAsRead(phoneNumberId, accessToken, message.id);

  // Extract plain text and (for buttons/lists) the encoded reply id.
  let text = '';
  let replyId = '';
  if (message.type === 'text') {
    text = message.text?.body?.trim() || '';
  } else if (message.type === 'interactive') {
    replyId = message.interactive?.button_reply?.id
      || message.interactive?.list_reply?.id || '';
    text = message.interactive?.button_reply?.title
      || message.interactive?.list_reply?.title || '';
  } else {
    // image / audio / location / etc. — off-script for the button flow.
    text = '';
  }

  const incomingLog = text || (replyId ? `[${replyId}]` : `[${message.type}]`);
  await logMessage(from, 'customer', incomingLog);

  const session = await loadSession(from);
  session.clientId = phoneNumberId;
  session.hasInteracted = true;

  const log = (role, msg) => logMessage(from, role, msg);

  try {
    await runBotFlow({ text, replyId }, client, session, from, log);
    const bot = session.bot;
    // Capture partial leads: once the customer has started (past the greeting)
    // and hasn't been finalized (Book/Expert), save/refresh an "In Progress" row.
    if (bot && bot.step !== 'start' && !bot.booked) {
      await upsertLead(client, bot, partialFields(bot, from), false);
    }
    // Converted leads shouldn't be chased by the re-engagement cron.
    if (bot?.booked) { session.bookedAppointment = true; session.followedUp = true; }
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
