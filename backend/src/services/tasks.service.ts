import { getDb } from '../db/database';
import { getTaskCountsPerColumn, getTasksByPriority } from '../db/queries';

const VALID_PRIORITIES = ['Low', 'Medium', 'High'] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

function isPriority(value: unknown): value is Priority {
  return VALID_PRIORITIES.includes(value as Priority);
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

export function getBoardWithColumns(boardId: number) {
  const db = getDb();

  const board = db.prepare('SELECT id, name FROM boards WHERE id = ?').get(boardId) as
    | { id: number; name: string }
    | undefined;

  if (!board) return null;

  const columns = db
    .prepare('SELECT id, board_id, name, position FROM columns WHERE board_id = ? ORDER BY position, id')
    .all(boardId) as { id: number; board_id: number; name: string; position: number }[];

  const tasks = db
    .prepare(
      `SELECT t.id, t.column_id, t.title, t.description, t.priority, t.created_at
       FROM tasks t
       JOIN columns c ON c.id = t.column_id
       WHERE c.board_id = ?
       ORDER BY t.created_at ASC`
    )
    .all(boardId) as {
    id: number;
    column_id: number;
    title: string;
    description: string | null;
    priority: string;
    created_at: string;
  }[];

  const columnsWithTasks = columns.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.column_id === col.id),
  }));

  return { ...board, columns: columnsWithTasks };
}

// ---------------------------------------------------------------------------
// Tasks filtered by priority (database-level — uses Query 2)
// ---------------------------------------------------------------------------

export function getTasksForBoard(boardId: number, priority?: string) {
  if (priority) {
    if (!isPriority(priority)) {
      throw new ValidationError('Priority must be Low, Medium, or High');
    }
    return getTasksByPriority(boardId, priority);
  }

  // No filter — return all tasks for the board
  const db = getDb();
  return db
    .prepare(
      `SELECT t.id, t.title, t.description, t.priority, t.created_at, t.column_id
       FROM tasks t
       JOIN columns c ON c.id = t.column_id
       WHERE c.board_id = ?
       ORDER BY t.created_at DESC`
    )
    .all(boardId);
}

// ---------------------------------------------------------------------------
// Task count per column (database-level — uses Query 1)
// ---------------------------------------------------------------------------

export function getColumnTaskCounts(boardId: number) {
  return getTaskCountsPerColumn(boardId);
}

// ---------------------------------------------------------------------------
// Create task
// ---------------------------------------------------------------------------

export function createTask(data: {
  title: string;
  description?: string;
  priority?: string;
  columnId: number;
}) {
  const db = getDb();

  const title = data.title?.trim();
  if (!title) throw new ValidationError('Task title is required');

  const priority = data.priority ?? 'Medium';
  if (!isPriority(priority)) {
    throw new ValidationError('Priority must be Low, Medium, or High');
  }

  const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(data.columnId);
  if (!column) throw new ValidationError('Column not found');

  const result = db
    .prepare(
      `INSERT INTO tasks (column_id, title, description, priority)
       VALUES (?, ?, ?, ?)`
    )
    .run(data.columnId, title, data.description?.trim() || null, priority);

  return db
    .prepare('SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE id = ?')
    .get(result.lastInsertRowid);
}

// ---------------------------------------------------------------------------
// Update task
// ---------------------------------------------------------------------------

export function updateTask(
  taskId: number,
  data: { title?: string; description?: string; priority?: string }
) {
  const db = getDb();

  const existing = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!existing) throw new NotFoundError('Task not found');

  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title) throw new ValidationError('Task title is required');
    fields.push('title = ?');
    values.push(title);
  }

  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description.trim() || null);
  }

  if (data.priority !== undefined) {
    if (!isPriority(data.priority)) {
      throw new ValidationError('Priority must be Low, Medium, or High');
    }
    fields.push('priority = ?');
    values.push(data.priority);
  }

  if (fields.length === 0) throw new ValidationError('No fields to update');

  values.push(taskId);
  db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  return db
    .prepare('SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE id = ?')
    .get(taskId);
}

// ---------------------------------------------------------------------------
// Move task
// ---------------------------------------------------------------------------

export function moveTask(taskId: number, columnId: number) {
  const db = getDb();

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) throw new NotFoundError('Task not found');

  const column = db.prepare('SELECT id FROM columns WHERE id = ?').get(columnId);
  if (!column) throw new ValidationError('Destination column not found');

  db.prepare('UPDATE tasks SET column_id = ? WHERE id = ?').run(columnId, taskId);

  return db
    .prepare('SELECT id, column_id, title, description, priority, created_at FROM tasks WHERE id = ?')
    .get(taskId);
}

// ---------------------------------------------------------------------------
// Delete task
// ---------------------------------------------------------------------------

export function deleteTask(taskId: number) {
  const db = getDb();

  const task = db.prepare('SELECT id FROM tasks WHERE id = ?').get(taskId);
  if (!task) throw new NotFoundError('Task not found');

  db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
}

// ---------------------------------------------------------------------------
// Custom error classes
// ---------------------------------------------------------------------------

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
