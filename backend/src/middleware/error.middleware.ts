import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

interface CustomError extends Error {
  statusCode?: number;
  details?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errorDetails = process.env.NODE_ENV === 'development' ? err.stack : undefined;

  console.error(`[ERROR] ${message}`, err);

  res.status(statusCode).json(error(message, errorDetails));
};
