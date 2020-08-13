import { NextFunction, Request, Response } from 'express';
import { Role } from 'models/common';

interface AuthRequest extends Request {
  auth: {
    id: string | null;
    role: Role;
    parentId: string;
  }
}

export const authRole = (role: Role) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (role !== req.auth.role) {
      res.status(403).json({ message: 'Access denied' })
    }
    next();
  }
}
