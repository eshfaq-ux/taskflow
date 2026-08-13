import { Request, Response, NextFunction } from 'express';
import * as tasksService from '../services/tasks.service';

export function getBoard(req: Request, res: Response, next: NextFunction): void {
  try {
    const boardId = parseInt(String(req.params.boardId), 10);
    if (isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board ID' });
      return;
    }

    const board = tasksService.getBoardWithColumns(boardId);
    if (!board) {
      res.status(404).json({ error: 'Board not found' });
      return;
    }

    res.json(board);
  } catch (err) {
    next(err);
  }
}

export function getBoardTasks(req: Request, res: Response, next: NextFunction): void {
  try {
    const boardId = parseInt(String(req.params.boardId), 10);
    if (isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board ID' });
      return;
    }

    const priority = req.query.priority as string | undefined;
    const tasks = tasksService.getTasksForBoard(boardId, priority);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export function getColumnCounts(req: Request, res: Response, next: NextFunction): void {
  try {
    const boardId = parseInt(String(req.params.boardId), 10);
    if (isNaN(boardId)) {
      res.status(400).json({ error: 'Invalid board ID' });
      return;
    }

    const counts = tasksService.getColumnTaskCounts(boardId);
    res.json(counts);
  } catch (err) {
    next(err);
  }
}

export function createTask(req: Request, res: Response, next: NextFunction): void {
  try {
    const task = tasksService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export function updateTask(req: Request, res: Response, next: NextFunction): void {
  try {
    const taskId = parseInt(String(req.params.taskId), 10);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    const task = tasksService.updateTask(taskId, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export function moveTask(req: Request, res: Response, next: NextFunction): void {
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

    const task = tasksService.moveTask(taskId, columnId);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export function deleteTask(req: Request, res: Response, next: NextFunction): void {
  try {
    const taskId = parseInt(String(req.params.taskId), 10);
    if (isNaN(taskId)) {
      res.status(400).json({ error: 'Invalid task ID' });
      return;
    }

    tasksService.deleteTask(taskId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
