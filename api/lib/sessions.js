import { getDb } from './db.js';

const FOLLOWUP_DELAY_MS = 20 * 60 * 60 * 1000; // 20 hours

function defaultSession() {
  return {
    state: 'idle',
    lastProduct: null,
    discountStage: 0,
    flowType: null,
    data: {},
    awaitingDoorPhoto: false,
    followUpAt: null,
    scheduledFollowUpSent: false,
    lastSeen: Date.now(),
    followedUp: false,
    hasInteracted: false,
    name: null,
    clientId: null,
    conversationHistory: [],
    bookedAppointment: false,
  };
}

export async function loadSession(phone) {
  const db = getDb();
  try {

    const { rows } = await db.query(
      'SELECT session_data FROM sessions WHERE phone = $1',
      [phone]
    );

    if (rows[0]) {
      const session = rows[0].session_data;
      if (!session.conversationHistory) session.conversationHistory = [];
      if (session.bookedAppointment === undefined) session.bookedAppointment = false;
      return session;
    }
  } catch (err) {
    console.warn('loadSession error:', err.message);
  }
  return defaultSession();
}

export async function saveSession(phone, session) {
  session.lastSeen = Date.now();
  const db = getDb();
  try {
    await db.query(`
      INSERT INTO sessions (phone, session_data, last_seen, client_id)
      VALUES ($1, $2, NOW(), $3)
      ON CONFLICT (phone) DO UPDATE SET
        session_data = EXCLUDED.session_data,
        last_seen = NOW(),
        client_id = EXCLUDED.client_id
    `, [phone, JSON.stringify(session), session.clientId || null]);
  } catch (err) {
    console.warn('saveSession error:', err.message);
  }
}

// Leads who went quiet (~20h) and haven't booked — the "next-day" re-engagement.
// Excludes anyone with a scheduled follow-up date (those are handled separately).
export async function getStaleSessions() {
  const db = getDb();
  try {
    const cutoff = new Date(Date.now() - FOLLOWUP_DELAY_MS).toISOString();
    const { rows } = await db.query(`
      SELECT phone, session_data, client_id
      FROM sessions
      WHERE last_seen < $1
        AND (session_data->>'followedUp')::boolean IS NOT TRUE
        AND (session_data->>'hasInteracted')::boolean IS TRUE
        AND (session_data->>'bookedAppointment')::boolean IS NOT TRUE
        AND (session_data->>'followUpAt') IS NULL
    `, [cutoff]);

    return rows.map(r => ({ from: r.phone, session: r.session_data }));
  } catch (err) {
    console.error('getStaleSessions error:', err.message);
    return [];
  }
}

// Leads who asked to be contacted on a specific later date that has now arrived.
export async function getScheduledFollowUps() {
  const db = getDb();
  try {
    const now = Date.now();
    const { rows } = await db.query(`
      SELECT phone, session_data, client_id
      FROM sessions
      WHERE (session_data->>'followUpAt') IS NOT NULL
        AND (session_data->>'followUpAt')::bigint <= $1
        AND (session_data->>'scheduledFollowUpSent')::boolean IS NOT TRUE
        AND (session_data->>'bookedAppointment')::boolean IS NOT TRUE
    `, [now]);

    return rows.map(r => ({ from: r.phone, session: r.session_data }));
  } catch (err) {
    console.error('getScheduledFollowUps error:', err.message);
    return [];
  }
}
