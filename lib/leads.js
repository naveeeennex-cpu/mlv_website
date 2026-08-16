import { getDb } from './db.js';
import { getConfig } from './config.js';
import { sendText } from './whatsapp.js';

// Pull the recent conversation transcript for this phone, for the lead record.
async function recentHistory(phone, limit = 40) {
  try {
    const db = getDb();
    const { rows } = await db.query(
      'SELECT role, message, created_at FROM messages WHERE phone = $1 ORDER BY created_at DESC LIMIT $2',
      [phone, limit]
    );
    return rows.reverse().map(r => ({ role: r.role, message: r.message, at: r.created_at }));
  } catch {
    return [];
  }
}

/**
 * Persist a lead and notify the owner on WhatsApp.
 * fields: { leadSource, phone, customerName, productId, productName,
 *           doorMaterial, doorConfiguration, doorLocation }
 */
/**
 * Create or update ONE lead row per conversation (tracked via bot.leadId).
 * Called partially on every step (notify=false, status "In Progress") so
 * incomplete conversations are captured, and finally on Book / Expert
 * (notify=true) with the final status + owner alert.
 */
export async function upsertLead(client, bot, fields, notify = false) {
  let leadId = bot?.leadId || null;
  try {
    const db = getDb();
    if (leadId) {
      await db.query(
        `UPDATE leads SET lead_source=$2,
           customer_name=COALESCE($3, customer_name),
           product_id=$4, product_name=$5, door_material=$6, door_configuration=$7,
           door_location=$8, budget=$9, status=$10
         WHERE id=$1`,
        [leadId, fields.leadSource || 'website', fields.customerName || null,
         fields.productId || null, fields.productName || null, fields.doorMaterial || null,
         fields.doorConfiguration || null, fields.doorLocation || null, fields.budget || null,
         fields.status || 'In Progress']
      );
    } else {
      const { rows } = await db.query(
        `INSERT INTO leads
          (lead_source, phone, customer_name, product_id, product_name,
           door_material, door_configuration, door_location, budget, conversation_history, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'[]'::jsonb,$10) RETURNING id`,
        [fields.leadSource || 'website', fields.phone, fields.customerName || null,
         fields.productId || null, fields.productName || null, fields.doorMaterial || null,
         fields.doorConfiguration || null, fields.doorLocation || null, fields.budget || null,
         fields.status || 'In Progress']
      );
      leadId = rows[0]?.id ?? null;
      if (bot) bot.leadId = leadId;
    }
    if (notify && leadId) {
      const history = await recentHistory(fields.phone);
      await db.query('UPDATE leads SET conversation_history=$2 WHERE id=$1', [leadId, JSON.stringify(history)]);
    }
  } catch (e) {
    console.error('upsertLead error:', e.message);
  }
  if (notify) await notifyOwner(client, fields, leadId);
  return leadId;
}

export async function saveLead(client, fields) {
  const history = await recentHistory(fields.phone);
  let leadId = null;
  try {
    const db = getDb();
    const { rows } = await db.query(
      `INSERT INTO leads
        (lead_source, phone, customer_name, product_id, product_name,
         door_material, door_configuration, door_location, budget, conversation_history, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id`,
      [
        fields.leadSource || 'website',
        fields.phone,
        fields.customerName || null,
        fields.productId || null,
        fields.productName || null,
        fields.doorMaterial || null,
        fields.doorConfiguration || null,
        fields.doorLocation || null,
        fields.budget || null,
        JSON.stringify(history),
        fields.status || 'New Lead',
      ]
    );
    leadId = rows[0]?.id ?? null;
  } catch (e) {
    console.error('saveLead insert error:', e.message);
  }

  await notifyOwner(client, fields, leadId);
  return leadId;
}

async function notifyOwner(client, f, leadId) {
  try {
    const ownerPhone = await getConfig('owner_phone', client.ownerPhone);
    if (!ownerPhone) return;
    const lines = [
      '🔔 *New WhatsApp Enquiry*',
      '',
      `Source: ${f.leadSource === 'meta' ? 'Meta Ads' : 'Website'}`,
      `From: wa.me/${f.phone}`,
      f.customerName ? `Name: ${f.customerName}` : null,
      f.productName ? `Product: ${f.productName}` : null,
      f.doorMaterial ? `Door: ${f.doorMaterial}` : null,
      f.doorConfiguration ? `Style: ${f.doorConfiguration}` : null,
      f.doorLocation ? `Location: ${f.doorLocation}` : null,
      f.budget ? `Budget: ${f.budget}` : null,
      leadId ? `\nLead #${leadId} · Status: ${f.status || 'New Lead'}` : null,
    ].filter(Boolean);
    await sendText(client.phoneNumberId, client.accessToken, ownerPhone, lines.join('\n'));
  } catch (e) {
    console.warn('notifyOwner error:', e.message);
  }
}
