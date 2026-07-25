import pg from 'pg';

const { Pool } = pg;

let pool;

// Accept the connection string under any of the common names a host might use.
// DATABASE_URL is ours; POSTGRES_URL* are what Vercel's Supabase integration injects.
const DB_URL_KEYS = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_PRISMA_URL',
  'POSTGRES_URL_NON_POOLING',
  'SUPABASE_DB_URL',
];

export function getDatabaseUrl() {
  for (const key of DB_URL_KEYS) {
    if (process.env[key]) return process.env[key];
  }
  return undefined;
}

export function getDb() {
  if (!pool) {
    const connectionString = getDatabaseUrl();
    if (!connectionString) {
      // Fail loudly and clearly so the Vercel function log names the real problem
      // instead of a generic pg connection error.
      throw new Error(
        `No database connection string set. Add one of [${DB_URL_KEYS.join(', ')}] ` +
        `to the environment (Vercel → Settings → Environment Variables) and redeploy.`
      );
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}
