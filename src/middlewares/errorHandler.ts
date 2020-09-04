import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'http-errors';

export const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction) => {
  if (err.expose) {
    res.status(err.statusCode).json({ messages: err.message });
    return;
  }

  res.status(500).json({ messages: 'Something broke!' });
}