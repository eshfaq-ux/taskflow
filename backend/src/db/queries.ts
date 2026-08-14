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

// ---------------------------------------------------------------------------
// Query 1 — Task count per column
//
// Uses LEFT JOIN so columns with zero tasks are still returned.
// Grouping and counting happen inside PostgreSQL, not in application code.
// ---------------------------------------------------------------------------

export async function getTaskCountsPerColumn(boardId: number): Promise<ColumnTaskCount[]> {
  const sql = `
    SELECT
      c.id,
      c.name,
      COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t
      ON t.column_id = c.id
    WHERE c.board_id = $1
    GROUP BY c.id, c.name
    ORDER BY c.position, c.id
  `;
  const { rows } = await getDb().query<{ id: number; name: string; task_count: string }>(sql, [boardId]);
  return rows.map((row: { id: number; name: string; task_count: string }) => ({
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
// ---------------------------------------------------------------------------

export async function getTasksByPriority(boardId: number, priority: string): Promise<TaskRow[]> {
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
// ---------------------------------------------------------------------------

export async function searchTasksByTitle(boardId: number, search: string): Promise<TaskRow[]> {
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
