import { NextFunction, Request, Response } from 'express';
import { Role } from 'models/common';


export const authRole = (role: Role) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log({role, auth: req.auth})
    if (role !== req.auth?.role) {
      res.status(403).json({ message: 'Access denied' });
      return;
    }
    next();
  }
}
