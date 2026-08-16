import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError } from '../services/tasks.service';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err.message);

  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
