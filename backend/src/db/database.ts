import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH ?? './taskflow.db';
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    throw new Error('Database not initialised. Call initDb() first.');
  }
  return db;
}

export function initDb(dbPath: string = DB_PATH): Database.Database {
  const isNew = !fs.existsSync(dbPath);

  db = new Database(dbPath);

  // Must be set on every connection — SQLite does not persist this flag
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);

  if (isNew) {
    const seed = fs.readFileSync(SEED_PATH, 'utf8');
    db.exec(seed);
  }

  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    // Allow re-initialisation (needed for test isolation)
    db = undefined as unknown as Database.Database;
  }
}
