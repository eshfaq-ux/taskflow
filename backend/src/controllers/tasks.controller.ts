import { Request, Response, NextFunction } from 'express';
import * as tasksService from '../services/tasks.service';

export async function getBoard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const boardId = parseInt(String(req.params.boardId), 10);
    if (isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board ID' });
      return;
    }

    const board = await tasksService.getBoardWithColumns(boardId);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    res.json(board);
  } catch (err) {
    next(err);
  }
}

export async function getBoardTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const boardId = parseInt(String(req.params.boardId), 10);
    if (isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board ID' });
      return;
    }

    const priority = req.query.priority as string | undefined;
    const search = req.query.search as string | undefined;
    const tasks = await tasksService.getTasksForBoard(boardId, priority, search);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getColumnCounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const boardId = parseInt(String(req.params.boardId), 10);
    if (isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board ID' });
      return;
    }

    const counts = await tasksService.getColumnTaskCounts(boardId);
    res.json(counts);
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await tasksService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const taskId = parseInt(String(req.params.taskId), 10);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const task = await tasksService.updateTask(taskId, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function moveTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const taskId = parseInt(String(req.params.taskId), 10);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const { columnId } = req.body;
    if (typeof columnId !== 'number') {
      res.status(400).json({ error: 'columnId must be a number' });
      return;
    }

    const task = await tasksService.moveTask(taskId, columnId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const taskId = parseInt(String(req.params.taskId), 10);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    await tasksService.deleteTask(taskId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
