-- PostgreSQL schema for TaskFlow
-- Run automatically on startup via database.ts (CREATE ... IF NOT EXISTS is idempotent)

CREATE TABLE IF NOT EXISTS boards (
  id   SERIAL      PRIMARY KEY,
  name TEXT        NOT NULL
);

CREATE TABLE IF NOT EXISTS columns (
  id       SERIAL  PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name     TEXT    NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL      PRIMARY KEY,
  column_id   INTEGER     NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  priority    TEXT        NOT NULL DEFAULT 'Medium'
                          CHECK(priority IN ('Low', 'Medium', 'High')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index to speed up fetching tasks for a column (used on every board load)
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);

-- Index to speed up the priority filter query (Query 2)
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
