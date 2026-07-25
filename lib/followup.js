import { getStaleSessions, getScheduledFollowUps, saveSession } from './sessions.js';
import { sendTemplate } from './whatsapp.js';
import { getClientByPhoneId, getAllClients } from './clients.js';
import { getConfig, invalidateConfig } from './config.js';
import { getDb } from './db.js';

// Follow-ups go out as an approved WhatsApp template ({{1}} = name, {{2}} = product),
// because anyone outside the 24h service window can only be reached via a template.
// Template name + language are admin-editable via config (defaults below).
export async function runFollowUp() {
  const cronEnabled = await getConfig('cron_enabled', 'true');
  if (cronEnabled === 'false') {
    return { sent: 0, failed: 0, total: 0, disabled: true };
  }

  const templateName = await getConfig('followup_template_name', 'mlv_followup');
  const templateLang = await getConfig('followup_template_lang', 'en');

  // Two kinds of due follow-ups (mutually exclusive — stale excludes scheduled leads):
  const scheduled = await getScheduledFollowUps();   // "contact me on <date>" has arrived
  const stale = await getStaleSessions();            // went quiet ~20h ago, never booked
  const jobs = [
    ...scheduled.map(s => ({ ...s, kind: 'scheduled' })),
    ...stale.map(s => ({ ...s, kind: 'stale' })),
  ];

  let sent = 0;
  let failed = 0;

  for (const { from, session, kind } of jobs) {
    const client = session.clientId
      ? getClientByPhoneId(session.clientId)
      : getAllClients()[0];

    if (!client) {
      console.warn(`No client found for session ${from}`);
      continue;
    }

    const name = session.name || session.data?.name || 'there';
    const product = session.lastProduct || 'Yale smart locks';

    try {
      const result = await sendTemplate(
        client.phoneNumberId,
        client.accessToken,
        from,
        templateName,
        templateLang,
        [name, product],
      );

      if (result.ok) {
        if (kind === 'scheduled') session.scheduledFollowUpSent = true;
        else session.followedUp = true;
        await saveSession(from, session);
        sent++;
        console.log(`Follow-up (${kind}) sent to ${from} (${name})`);
      } else {
        const errText = await result.text().catch(() => '');
        console.error(`Follow-up failed for ${from}:`, errText);
        failed++;
      }
    } catch (err) {
      console.error(`Follow-up error for ${from}:`, err.message);
      failed++;
    }
  }

  // Record last run stats
  try {
    const db = getDb();
    await db.query(`
      INSERT INTO admin_config (key, value) VALUES ('cron_last_run', $1), ('cron_last_count', $2)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [new Date().toISOString(), String(sent)]);
    invalidateConfig('cron_last_run');
    invalidateConfig('cron_last_count');
  } catch {}

  console.log(`Follow-up done — sent: ${sent}, failed: ${failed}, total: ${jobs.length} (scheduled: ${scheduled.length}, stale: ${stale.length})`);
  return { sent, failed, total: jobs.length };
}
