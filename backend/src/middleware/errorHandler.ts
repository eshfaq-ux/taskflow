import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError } from '../services/tasks.service';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  // Unknown error — log it server-side but do NOT expose internals to the client
  console.error('[TaskFlow error]', err);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
}
