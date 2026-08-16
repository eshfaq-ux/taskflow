import { Pool } from 'pg';
import { SCHEMA_SQL, SEED_SQL } from './sql';

const DATABASE_URL = process.env.DATABASE_URL;

let pool: Pool;

export function getDb(): Pool {
  if (!pool) {
    throw new Error('Database not initialised. Call initDb() first.');
  }
  return pool;
}

export async function initDb(): Promise<Pool> {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  // Optimize pool settings for production and development
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    // Connection pool configuration
    max: process.env.NODE_ENV === 'production' ? 20 : 10, // More connections in production
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Wait max 2s for a connection
  });

  // Verify connectivity
  await pool.query('SELECT NOW()');

  // CREATE TABLE IF NOT EXISTS is idempotent — safe to run on every startup
  await pool.query(SCHEMA_SQL);

  // Seed only when the boards table is empty (fresh database)
  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM boards');
  if (parseInt(rows[0].count, 10) === 0) {
    await pool.query(SEED_SQL);
  }

  return pool;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined as unknown as Pool;
  }
}
