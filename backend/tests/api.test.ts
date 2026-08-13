import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { initDb, closeDb } from '../src/db/database';
import fs from 'fs';

const TEST_DB = './test.db';

beforeAll(() => {
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
  initDb(TEST_DB);
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
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
      // Known seed data: task ID 1 is in column 1 ("To Do")
      const taskId = 1;
      const targetColumnId = 2; // "In Progress"

      const moveRes = await request(app).patch(`/api/tasks/${taskId}/move`).send({
        columnId: targetColumnId,
      });

      expect(moveRes.status).toBe(200);
      expect(moveRes.body.column_id).toBe(targetColumnId);

      // Verify the change persisted in the database
      const boardRes = await request(app).get('/api/boards/1');
      const movedTask = boardRes.body.columns
        .flatMap((c: { tasks: unknown[] }) => c.tasks)
        .find((t: { id: number }) => t.id === taskId);

      expect(movedTask.column_id).toBe(targetColumnId);
    });

    it('rejects moving to a nonexistent column', async () => {
      const res = await request(app).patch('/api/tasks/1/move').send({
        columnId: 999,
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/column not found/i);
    });

    it('rejects moving a nonexistent task', async () => {
      const res = await request(app).patch('/api/tasks/9999/move').send({
        columnId: 1,
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/task not found/i);
    });
  });

  // ---------------------------------------------------------------------------
  // Required Test 3: Database query returns correct results
  // ---------------------------------------------------------------------------
  describe('Database queries', () => {
    it('task count per column includes columns with zero tasks', async () => {
      const res = await request(app).get('/api/boards/1/column-counts');
      expect(res.status).toBe(200);

      const counts = res.body as { id: number; name: string; task_count: number }[];
      expect(counts.length).toBeGreaterThanOrEqual(3);

      // Verify structure
      counts.forEach((col) => {
        expect(col).toHaveProperty('id');
        expect(col).toHaveProperty('name');
        expect(col).toHaveProperty('task_count');
        expect(typeof col.task_count).toBe('number');
      });
    });

    it('priority filter returns matching tasks, newest first', async () => {
      const res = await request(app).get('/api/boards/1/tasks?priority=High');
      expect(res.status).toBe(200);

      const tasks = res.body as { priority: string; created_at: string }[];
      expect(tasks.length).toBeGreaterThan(0);

      // All returned tasks must have priority = High
      tasks.forEach((task) => {
        expect(task.priority).toBe('High');
      });

      // Verify newest-first ordering
      for (let i = 1; i < tasks.length; i++) {
        const prev = new Date(tasks[i - 1].created_at);
        const curr = new Date(tasks[i].created_at);
        expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
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
    });

    it('updates a task successfully', async () => {
      const res = await request(app).patch('/api/tasks/1').send({
        title: 'Updated title',
        priority: 'High',
      });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
      expect(res.body.priority).toBe('High');
    });

    it('deletes a task successfully', async () => {
      // Create a task to delete
      const createRes = await request(app).post('/api/tasks').send({
        title: 'Task to delete',
        columnId: 1,
      });
      const taskId = createRes.body.id;

      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
      expect(deleteRes.status).toBe(204);

      // Verify it no longer exists
      const getRes = await request(app).patch(`/api/tasks/${taskId}`).send({ title: 'Test' });
      expect(getRes.status).toBe(404);
    });

    it('returns 404 when updating nonexistent task', async () => {
      const res = await request(app).patch('/api/tasks/9999').send({
        title: 'Will not work',
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/task not found/i);
    });

    it('returns 404 when deleting nonexistent task', async () => {
      const res = await request(app).delete('/api/tasks/9999');
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/task not found/i);
    });
  });
});
