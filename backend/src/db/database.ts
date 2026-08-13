import Database from 'better-sqlite3';
import fs from 'fs';
import { SCHEMA_SQL, SEED_SQL } from './sql';

const DB_PATH = process.env.DB_PATH ?? './taskflow.db';

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

  db.exec(SCHEMA_SQL);

  if (isNew) {
    db.exec(SEED_SQL);
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
