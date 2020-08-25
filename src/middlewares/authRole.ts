import { NextFunction, Request, Response } from 'express';
import { Forbidden } from 'http-errors';
import { Role } from 'models/common';


export const authRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || !roles.find(role => role === userRole)) {
      throw new Forbidden();
    }
    next();
  }
}
