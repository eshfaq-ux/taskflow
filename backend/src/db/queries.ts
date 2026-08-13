/**
 * queries.ts
 *
 * All non-trivial database queries live here so they are easy to locate,
 * read, and demonstrate during a technical walkthrough.
 *
 * These queries are executed by SQLite — they do NOT fetch all rows and
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
// Grouping and counting happen inside SQLite, not in application code.
// ---------------------------------------------------------------------------

export function getTaskCountsPerColumn(boardId: number): ColumnTaskCount[] {
  const sql = `
    SELECT
      c.id,
      c.name,
      COUNT(t.id) AS task_count
    FROM columns c
    LEFT JOIN tasks t
      ON t.column_id = c.id
    WHERE c.board_id = ?
    GROUP BY c.id, c.name
    ORDER BY c.position, c.id
  `;
  return getDb().prepare(sql).all(boardId) as ColumnTaskCount[];
}

// ---------------------------------------------------------------------------
// Query 2 — Tasks by priority, newest first
//
// Joins tasks → columns to scope the query to a specific board.
// Filtering and ordering happen inside SQLite.
// ---------------------------------------------------------------------------

export function getTasksByPriority(boardId: number, priority: string): TaskRow[] {
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
    WHERE c.board_id = ?
      AND t.priority = ?
    ORDER BY t.created_at DESC
  `;
  return getDb().prepare(sql).all(boardId, priority) as TaskRow[];
}
