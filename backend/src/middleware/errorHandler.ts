import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error(`Error ${status}: ${message}`);
  console.error(error.stack);

  res.status(status).json({
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};