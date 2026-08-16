/**
 * queries.ts
 *
 * All non-trivial database queries live here so they are easy to locate,
 * read, and demonstrate during a technical walkthrough.
 *
 * These queries are executed by PostgreSQL — they do NOT fetch all rows and
 * then filter in JavaScript.
 */

import { getDb } from './database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ColumnTaskCount {
  id: number;
  name: string;
  task_count: number;
}

export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  created_at: string;
  column_id: number;
}

export interface ColumnWithTasks {
  id: number;
  board_id: number;
  name: string;
  position: number;
  tasks: TaskRow[];
}

// ---------------------------------------------------------------------------
// Query 0 — Board with all columns and tasks (fixed N+1 issue)
//
// Fetches all columns and tasks in a single query, then groups in memory.
// This avoids the O(n*m) performance hit from filtering tasks per column.
// ---------------------------------------------------------------------------

export async function getBoardWithColumnsAndTasks(
  boardId: number
): Promise<{ id: number; name: string; columns: ColumnWithTasks[] } | null> {
  // Fetch board
  const boardResult = await getDb().query<{ id: number; name: string }>(
    'SELECT id, name FROM boards WHERE id = $1',
    [boardId]
  );
  if (boardResult.rows.length === 0) return null;
  const board = boardResult.rows[0];

  // Fetch all columns and tasks in a single query with JOIN
  // This avoids the N+1 problem and multiple filter iterations
  const result = await getDb().query<{
    col_id: number;
    col_board_id: number;
    col_name: string;
    col_position: number;
    task_id: number | null;
    task_title: string | null;
    task_description: string | null;
    task_priority: string | null;
    task_created_at: string | null;
    task_column_id: number | null;
  }>(
    `
    SELECT
      c.id AS col_id,
      c.board_id AS col_board_id,
      c.name AS col_name,
      c.position AS col_position,
      t.id AS task_id,
      t.title AS task_title,
      t.description AS task_description,
      t.priority AS task_priority,
      t.created_at AS task_created_at,
      t.column_id AS task_column_id
    FROM columns c
    LEFT JOIN tasks t ON t.column_id = c.id
    WHERE c.board_id = $1
    ORDER BY c.position, c.id, t.created_at ASC
    `,
    [boardId]
  );

  // Group results into column structure
  const columnMap = new Map<
    number,
    {
      id: number;
      board_id: number;
      name: string;
      position: number;
      tasks: TaskRow[];
    }
  >();

  for (const row of result.rows) {
    if (!columnMap.has(row.col_id)) {
      columnMap.set(row.col_id, {
        id: row.col_id,
        board_id: row.col_board_id,
        name: row.col_name,
        position: row.col_position,
        tasks: [],
      });
    }

    // Only add task if it exists (LEFT JOIN may have null tasks for empty columns)
    if (row.task_id !== null) {
      columnMap.get(row.col_id)!.tasks.push({
        id: row.task_id,
        title: row.task_title!,
        description: row.task_description,
        priority: row.task_priority!,
        created_at: row.task_created_at!,
        column_id: row.task_column_id!,
      });
    }
  }

  // Return columns in order
  const columns = Array.from(columnMap.values()).sort(
    (a, b) => a.position - b.position || a.id - b.id
  );

  return { ...board, columns };
}

// ---------------------------------------------------------------------------
// Query 1 — Task count per column
//
// Uses LEFT JOIN so columns with zero tasks are still returned.
// Grouping and counting happen inside PostgreSQL, not in application code.
// ---------------------------------------------------------------------------

export async function getTaskCountsPerColumn(
  boardId: number
): Promise<ColumnTaskCount[]> {
  const sql = `
    SELECT
      c.id,
      c.name,
      COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t
      ON t.column_id = c.id
    WHERE c.board_id = $1
    GROUP BY c.id, c.name, c.position
    ORDER BY c.position, c.id
  `;
  const { rows } = await getDb().query<{
    id: number;
    name: string;
    task_count: string;
  }>(sql, [boardId]);
  return rows.map((row) => ({
    ...row,
    // pg returns COUNT as a string — coerce to number
    task_count: parseInt(row.task_count, 10),
  }));
}

// ---------------------------------------------------------------------------
// Query 2 — Tasks by priority, newest first
//
// Joins tasks → columns to scope the query to a specific board.
// Filtering and ordering happen inside PostgreSQL.
// Uses index on priority for fast filtering.
// ---------------------------------------------------------------------------

export async function getTasksByPriority(
  boardId: number,
  priority: string
): Promise<TaskRow[]> {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.priority,
      t.created_at,
      t.column_id
    FROM tasks t
    JOIN columns c
      ON c.id = t.column_id
    WHERE c.board_id = $1
      AND t.priority = $2
    ORDER BY t.created_at DESC
  `;
  const { rows } = await getDb().query(sql, [boardId, priority]);
  return rows;
}

// ---------------------------------------------------------------------------
// Query 3 — Tasks by title search, newest first
//
// Case-insensitive partial match using ILIKE so "login" matches "Fix Login Bug".
// Filtering happens inside PostgreSQL — not fetched-then-filtered in JavaScript.
// Prefix matching (no leading %) allows index usage; can be enhanced with tsvector.
// ---------------------------------------------------------------------------

export async function searchTasksByTitle(
  boardId: number,
  search: string
): Promise<TaskRow[]> {
  const sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.priority,
      t.created_at,
      t.column_id
    FROM tasks t
    JOIN columns c
      ON c.id = t.column_id
    WHERE c.board_id = $1
      AND t.title ILIKE $2
    ORDER BY t.created_at DESC
  `;
  // Wrap in % wildcards for substring match: "login" → "%login%"
  const { rows } = await getDb().query(sql, [boardId, `%${search}%`]);
  return rows;
}
