// SQL schema and seed data as embedded strings
// PostgreSQL version

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS boards (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS columns (
  id       SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  name     TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  column_id   INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  priority    TEXT NOT NULL DEFAULT 'Medium'
                   CHECK(priority IN ('Low', 'Medium', 'High')),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index to speed up fetching tasks for a column (used on every board load)
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);

-- Index to speed up the priority filter query (Query 2)
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
`;

export const SEED_SQL = `-- Seed data: one board, three columns, eight tasks across different priorities
INSERT INTO boards (name) VALUES ('My Team Board');

INSERT INTO columns (board_id, name, position) VALUES
  (1, 'To Do',       0),
  (1, 'In Progress', 1),
  (1, 'Done',        2);

INSERT INTO tasks (column_id, title, description, priority, created_at) VALUES
  (1, 'Set up CI pipeline',         'Configure GitHub Actions for lint and test', 'High',   '2026-08-01 09:00:00'),
  (1, 'Write onboarding docs',      NULL,                                          'Medium', '2026-08-02 10:00:00'),
  (1, 'Add dark mode',              'Toggle in user settings',                     'Low',    '2026-08-03 11:00:00'),
  (2, 'Build task board UI',        'React + Vite frontend',                       'High',   '2026-08-04 09:30:00'),
  (2, 'Implement priority filter',  'Database-level query, not in-memory',         'High',   '2026-08-05 14:00:00'),
  (2, 'REST API for task CRUD',     'Express + PostgreSQL',                        'Medium', '2026-08-06 08:00:00'),
  (3, 'Design relational schema',   'boards → columns → tasks',                    'High',   '2026-08-07 10:00:00'),
  (3, 'Project scaffolding',        NULL,                                          'Low',    '2026-08-08 09:00:00');
`;
