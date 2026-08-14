import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError } from '../services/tasks.service';

// pg driver attaches a `code` property to database errors
interface PgError extends Error {
  code?: string;
}

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

  // Intercept pg constraint violations — do not expose raw DB messages to clients
  const pgErr = err as PgError;
  if (pgErr.code === '23505') {
    // unique_violation
    res.status(409).json({ error: 'A duplicate record already exists.' });
    return;
  }
  if (pgErr.code === '23503') {
    // foreign_key_violation
    res.status(400).json({ error: 'Referenced record does not exist.' });
    return;
  }
  if (pgErr.code === '23514') {
    // check_violation (e.g. invalid priority sneaking past service layer)
    res.status(400).json({ error: 'Invalid field value.' });
    return;
  }

  // Unknown error — log server-side only, never expose internals to the client
  console.error('[TaskFlow error]', err);
  res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
}
