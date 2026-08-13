-- Enable foreign key enforcement (must be set per connection in SQLite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS boards (
  id   INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS columns (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name     TEXT    NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  column_id   INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       TEXT    NOT NULL,
  description TEXT,
  priority    TEXT    NOT NULL DEFAULT 'Medium'
                      CHECK(priority IN ('Low', 'Medium', 'High')),
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Index to speed up fetching tasks for a column (used on every board load)
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);

-- Index to speed up the priority filter query (Query 2)
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
