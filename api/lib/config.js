import { getDb } from './db.js';

const cache = {};
const TTL = 5 * 60 * 1000; // 5 minutes

export async function getConfig(key, fallback = null) {
  const now = Date.now();
  if (cache[key] && now - cache[key].at < TTL) return cache[key].value;
  try {
    const db = getDb();
    const { rows } = await db.query('SELECT value FROM admin_config WHERE key = $1', [key]);
    if (rows[0]) {
      cache[key] = { value: rows[0].value, at: now };
      return rows[0].value;
    }
  } catch { /* fallback */ }
  return fallback;
}

export function invalidateConfig(key) {
  delete cache[key];
}
