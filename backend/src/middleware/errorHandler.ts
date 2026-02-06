import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  code: string;

  constructor(message: string, opts?: { status?: number; code?: string }) {
    super(message);
    this.name = 'AppError';
    this.status = opts?.status ?? 400;
    this.code = opts?.code ?? 'BAD_REQUEST';
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const requestId = req.id;

  // log the server error once, centrally
  console.error(
    JSON.stringify({
      level: 'error',
      requestId,
      method: req.method,
      path: req.path,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    })
  );

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { message: err.message, code: err.code, requestId }
    });
  }

  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      requestId
    }
  });
}