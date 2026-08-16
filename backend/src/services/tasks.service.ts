import { getDb } from '../db/database';
import {
  getTaskCountsPerColumn,
  getTasksByPriority,
  searchTasksByTitle,
  getBoardWithColumnsAndTasks,
} from '../db/queries';

const VALID_PRIORITIES = ['Low', 'Medium', 'High'] as const;
type Priority = (typeof VALID_PRIORITIES)[number];

function isPriority(value: unknown): value is Priority {
  return VALID_PRIORITIES.includes(value as Priority);
}

// ---------------------------------------------------------------------------
// Shared row type returned by most task queries
// ---------------------------------------------------------------------------

interface TaskRow {
  id: number;
  column_id: number;
  title: string;
  description: string | null;
  priority: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

export async function getBoardWithColumns(boardId: number) {
  // Use optimized query that fetches all columns and tasks in a single query
  // This avoids the N+1 problem of filtering tasks per column in memory
  return getBoardWithColumnsAndTasks(boardId);
}

// ---------------------------------------------------------------------------
// Tasks filtered by priority or title search (database-level)
// ---------------------------------------------------------------------------

export async function getTasksForBoard(
  boardId: number,
  priority?: string,
  search?: string
) {
  // Title search takes precedence when both params are supplied — the two
  // filters are independent controls and combining them is not required.
  if (search) {
    const trimmed = search.trim();
    if (!trimmed) {
      // Empty/whitespace search — fall through to full board below
    } else {
      return searchTasksByTitle(boardId, trimmed);
    }
  }

  if (priority) {
    if (!isPriority(priority)) {
      throw new ValidationError('Priority must be Low, Medium, or High');
    }
    return getTasksByPriority(boardId, priority);
  }

  // No filter — return all tasks for the board ordered newest first
  const { rows } = await getDb().query(
    `SELECT t.id, t.title, t.description, t.priority, t.created_at, t.column_id
     FROM tasks t
     JOIN columns c ON c.id = t.column_id
     WHERE c.board_id = $1
     ORDER BY t.created_at DESC`,
    [boardId]
  );
  return rows;
}

// ---------------------------------------------------------------------------
// Task count per column (database-level — uses Query 1)
// ---------------------------------------------------------------------------

export async function getColumnTaskCounts(boardId: number) {
  return getTaskCountsPerColumn(boardId);
}

// ---------------------------------------------------------------------------
// Create task
// ---------------------------------------------------------------------------

export async function createTask(data: {
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

  const colResult = await db.query('SELECT id FROM columns WHERE id = $1', [
    data.columnId,
  ]);
  if (colResult.rows.length === 0)
    throw new ValidationError('Column not found');

  const insertResult = await db.query<TaskRow>(
    `INSERT INTO tasks (column_id, title, description, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING id, column_id, title, description, priority, created_at`,
    [data.columnId, title, data.description?.trim() || null, priority]
  );

  return insertResult.rows[0];
}

// ---------------------------------------------------------------------------
// Update task
// ---------------------------------------------------------------------------

export async function updateTask(
  taskId: number,
  data: { title?: string; description?: string; priority?: string }
) {
  const db = getDb();

  const existResult = await db.query('SELECT id FROM tasks WHERE id = $1', [
    taskId,
  ]);
  if (existResult.rows.length === 0)
    throw new NotFoundError('Task not found');

  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    const title = data.title.trim();
    if (!title) throw new ValidationError('Task title is required');
    fields.push(`title = $${paramIndex++}`);
    values.push(title);
  }

  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description.trim() || null);
  }

  if (data.priority !== undefined) {
    if (!isPriority(data.priority)) {
      throw new ValidationError('Priority must be Low, Medium, or High');
    }
    fields.push(`priority = $${paramIndex++}`);
    values.push(data.priority);
  }

  if (fields.length === 0)
    throw new ValidationError('No fields to update');

  values.push(taskId);
  const updateResult = await db.query<TaskRow>(
    `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${paramIndex}
     RETURNING id, column_id, title, description, priority, created_at`,
    values
  );

  return updateResult.rows[0];
}

// ---------------------------------------------------------------------------
// Move task
// ---------------------------------------------------------------------------

export async function moveTask(taskId: number, columnId: number) {
  const db = getDb();

  const taskResult = await db.query('SELECT id FROM tasks WHERE id = $1', [
    taskId,
  ]);
  if (taskResult.rows.length === 0)
    throw new NotFoundError('Task not found');

  const colResult = await db.query('SELECT id FROM columns WHERE id = $1', [
    columnId,
  ]);
  if (colResult.rows.length === 0)
    throw new ValidationError('Destination column not found');

  const updateResult = await db.query<TaskRow>(
    `UPDATE tasks SET column_id = $1 WHERE id = $2
     RETURNING id, column_id, title, description, priority, created_at`,
    [columnId, taskId]
  );

  return updateResult.rows[0];
}

// ---------------------------------------------------------------------------
// Delete task
// ---------------------------------------------------------------------------

export async function deleteTask(taskId: number) {
  const db = getDb();

  const taskResult = await db.query('SELECT id FROM tasks WHERE id = $1', [
    taskId,
  ]);
  if (taskResult.rows.length === 0)
    throw new NotFoundError('Task not found');

  await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
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
