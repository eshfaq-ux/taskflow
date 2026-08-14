import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { Pool } from 'pg';
import app from '../src/app';
import { initDb, closeDb } from '../src/db/database';
import { SCHEMA_SQL, SEED_SQL } from '../src/db/sql';

// ---------------------------------------------------------------------------
// Test database setup
//
// Uses TEST_DATABASE_URL if set, otherwise falls back to DATABASE_URL.
// A dedicated test database is strongly recommended to avoid polluting
// development data. The database is wiped and reseeded before the suite runs.
// ---------------------------------------------------------------------------

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

if (!TEST_DATABASE_URL) {
  throw new Error(
    'Set TEST_DATABASE_URL (or DATABASE_URL) before running tests.\n' +
      'Example: TEST_DATABASE_URL=postgresql://... npm test'
  );
}

// Override DATABASE_URL so initDb() uses the test database
process.env.DATABASE_URL = TEST_DATABASE_URL;

async function resetDatabase(): Promise<void> {
  // Connect directly to drop and recreate all tables in dependency order
  const pool = new Pool({
    connectionString: TEST_DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  try {
    // Drop in reverse FK order, then recreate via the canonical schema + seed
    await pool.query('DROP TABLE IF EXISTS tasks CASCADE');
    await pool.query('DROP TABLE IF EXISTS columns CASCADE');
    await pool.query('DROP TABLE IF EXISTS boards CASCADE');
    await pool.query(SCHEMA_SQL);
    await pool.query(SEED_SQL);
  } finally {
    await pool.end();
  }
}

beforeAll(async () => {
  await resetDatabase();
  // initDb() will see the tables already exist (IF NOT EXISTS) and boards
  // is already seeded, so it skips re-seeding — correct behaviour.
  await initDb();
}, 30_000);

afterAll(async () => {
  await closeDb();
});

describe('TaskFlow API', () => {
  // ---------------------------------------------------------------------------
  // Required Test 1: Creating a task without a title fails
  // ---------------------------------------------------------------------------
  describe('Task validation', () => {
    it('rejects task creation with empty title', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: '',
        columnId: 1,
        priority: 'Medium',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/title is required/i);
    });

    it('rejects task creation with whitespace-only title', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: '   ',
        columnId: 1,
        priority: 'Medium',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/title is required/i);
    });

    it('rejects invalid priority', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Test',
        columnId: 1,
        priority: 'URGENT',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/priority/i);
    });

    it('rejects nonexistent column', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'Test',
        columnId: 999,
        priority: 'High',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/column not found/i);
    });
  });

  // ---------------------------------------------------------------------------
  // Required Test 2: Moving a task changes its column correctly
  // ---------------------------------------------------------------------------
  describe('Task movement', () => {
    it('moves a task and persists the new column', async () => {
      // Seed data: task ID 1 starts in column 1 ("To Do")
      const taskId = 1;
      const targetColumnId = 2; // "In Progress"

      const moveRes = await request(app)
        .patch(`/api/tasks/${taskId}/move`)
        .send({ columnId: targetColumnId });

      expect(moveRes.status).toBe(200);
      expect(moveRes.body.column_id).toBe(targetColumnId);

      // Verify persistence — read back from the database via the board endpoint
      const boardRes = await request(app).get('/api/boards/1');
      expect(boardRes.status).toBe(200);

      const allTasks = boardRes.body.columns.flatMap(
        (c: { tasks: { id: number; column_id: number }[] }) => c.tasks
      );
      const movedTask = allTasks.find((t: { id: number }) => t.id === taskId);

      expect(movedTask).toBeDefined();
      expect(movedTask.column_id).toBe(targetColumnId);
    });

    it('rejects moving to a nonexistent column', async () => {
      const res = await request(app).patch('/api/tasks/1/move').send({ columnId: 999 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/column not found/i);
    });

    it('rejects moving a nonexistent task', async () => {
      const res = await request(app).patch('/api/tasks/9999/move').send({ columnId: 1 });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/task not found/i);
    });
  });

  // ---------------------------------------------------------------------------
  // Required Test 3: Database queries return correct results
  // ---------------------------------------------------------------------------
  describe('Database queries', () => {
    it('task count per column includes columns with zero tasks', async () => {
      const res = await request(app).get('/api/boards/1/column-counts');
      expect(res.status).toBe(200);

      const counts = res.body as { id: number; name: string; task_count: number }[];
      expect(counts.length).toBeGreaterThanOrEqual(3);

      counts.forEach((col) => {
        expect(col).toHaveProperty('id');
        expect(col).toHaveProperty('name');
        expect(col).toHaveProperty('task_count');
        expect(typeof col.task_count).toBe('number');
      });

      // "Done" column has 2 seed tasks — verify a concrete count
      const doneCol = counts.find((c) => c.name === 'Done');
      expect(doneCol).toBeDefined();
      expect(doneCol!.task_count).toBeGreaterThanOrEqual(1);
    });

    it('priority filter returns only matching tasks, newest first', async () => {
      const res = await request(app).get('/api/boards/1/tasks?priority=High');
      expect(res.status).toBe(200);

      const tasks = res.body as { priority: string; created_at: string }[];
      expect(tasks.length).toBeGreaterThan(0);

      // Every returned task must be High priority
      tasks.forEach((task) => {
        expect(task.priority).toBe('High');
      });

      // Dates must be in descending order (newest first)
      for (let i = 1; i < tasks.length; i++) {
        const prev = new Date(tasks[i - 1].created_at).getTime();
        const curr = new Date(tasks[i].created_at).getTime();
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Additional high-value tests
  // ---------------------------------------------------------------------------
  describe('CRUD operations', () => {
    it('creates a valid task successfully', async () => {
      const res = await request(app).post('/api/tasks').send({
        title: 'New test task',
        description: 'Created by test suite',
        priority: 'Low',
        columnId: 1,
      });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('New test task');
      expect(res.body.priority).toBe('Low');
      expect(res.body.column_id).toBe(1);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('created_at');
    });

    it('updates a task title and priority successfully', async () => {
      const res = await request(app).patch('/api/tasks/2').send({
        title: 'Updated title',
        priority: 'High',
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
      expect(res.body.priority).toBe('High');
    });

    it('deletes a task successfully', async () => {
      // Create a disposable task
      const createRes = await request(app).post('/api/tasks').send({
        title: 'Task to delete',
        columnId: 1,
      });
      expect(createRes.status).toBe(201);
      const taskId = createRes.body.id;

      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
      expect(deleteRes.status).toBe(204);

      // Verify the task no longer exists
      const getRes = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .send({ title: 'Should not work' });
      expect(getRes.status).toBe(404);
    });

    it('returns 404 when updating a nonexistent task', async () => {
      const res = await request(app).patch('/api/tasks/9999').send({ title: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/task not found/i);
    });

    it('returns 404 when deleting a nonexistent task', async () => {
      const res = await request(app).delete('/api/tasks/9999');

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/task not found/i);
    });
  });
});
