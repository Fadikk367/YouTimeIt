import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Unauthorized, BadRequest } from 'http-errors';

import { Role } from '../models/common';
import { User, Client } from '../models';


interface TokenPayload {
  _id: string;
  role: Role
}


export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['auth-token'] as string;

  try {
    if (token) {
      const secret = process.env.TOKEN_SECRET as string;
      const blueprint = await jwt.verify(token, secret) as TokenPayload;
      const { role } = blueprint;

      if (Object.values(Role).includes(role)) {
        await handleUserAuthentification(req, blueprint);
      }
    }

    next();
  } catch(err) {
    next(err);
  }
}


const handleUserAuthentification = async (req: Request, blueprint: TokenPayload): Promise<void> => {
  const user = await User.findOne({ _id: blueprint._id });
  if (!user) {
    throw new Unauthorized();
  }

  if (req.params.businessId && !user.businessId.equals(req.params.businessId))
    throw new BadRequest();

  req.user = user;
}