import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sanitizeError } from '../utils/errorMapper';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: 'Validation failed. Please verify your input.',
      code: 'VALIDATION_ERROR',
      details: formattedErrors,
    });
  }

  // Server-side detailed logging with stack trace (kept private)
  logger.error('API Error [%s %s]: %s', req.method, req.path, err.message, {
    stack: err.stack,
    userId: req.user?.id,
  });

  const sanitized = sanitizeError(err);

  res.status(sanitized.statusCode).json({
    success: false,
    error: sanitized.message,
    code: sanitized.code,
    action: sanitized.action || undefined,
  });
}
