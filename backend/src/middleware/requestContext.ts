import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const id = crypto.randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}