-- Seed data: one board, three columns, eight tasks across different priorities
INSERT INTO boards (name) VALUES ('My Team Board');

INSERT INTO columns (board_id, name, position) VALUES
  (1, 'To Do',       0),
  (1, 'In Progress', 1),
  (1, 'Done',        2);

INSERT INTO tasks (column_id, title, description, priority, created_at) VALUES
  (1, 'Set up CI pipeline',         'Configure GitHub Actions for lint and test', 'High',   '2026-08-01T09:00:00.000Z'),
  (1, 'Write onboarding docs',      NULL,                                          'Medium', '2026-08-02T10:00:00.000Z'),
  (1, 'Add dark mode',              'Toggle in user settings',                     'Low',    '2026-08-03T11:00:00.000Z'),
  (2, 'Build task board UI',        'React + Vite frontend',                       'High',   '2026-08-04T09:30:00.000Z'),
  (2, 'Implement priority filter',  'Database-level query, not in-memory',         'High',   '2026-08-05T14:00:00.000Z'),
  (2, 'REST API for task CRUD',     'Express + better-sqlite3',                    'Medium', '2026-08-06T08:00:00.000Z'),
  (3, 'Design relational schema',   'boards → columns → tasks',                    'High',   '2026-08-07T10:00:00.000Z'),
  (3, 'Project scaffolding',        NULL,                                          'Low',    '2026-08-08T09:00:00.000Z');
