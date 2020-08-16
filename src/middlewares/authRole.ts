import { NextFunction, Request, Response } from 'express';
import { Role } from 'models/common';


export const authRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.auth?.role;
    if (!roles.find(role => role === userRole)) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  }
}
