import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { Role } from 'models/common';
import { User, Client } from 'models';


interface TokenPayload {
  _id: string;
  role: Role
}


export const authUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('auth-token');

  if (token) {
    try {
      const secret = process.env.TOKRN_SECRET as string;
      const blueprint = await jwt.verify(token, secret) as TokenPayload;

      const role = blueprint.role;
      if (role === Role.USER) {
        handleUserRequest(req, blueprint);
      } else if (role === Role.CLIENT) {
        handleClientRequest(req, blueprint);
      }
      next();
    } catch(err) {
      console.error(err);
      res.status(400).json({ message: err.message })
    }
  } else {
    handleUnregisteredRequest(req);
    next();
  }
}

const handleUserRequest = async (req: Request, blueprint: TokenPayload): Promise<void> => {
  const user = await User.findOne({ _id: blueprint._id });
  if (!user) {
    throw new Error('User with given Id does not exist');
  }

  req.auth = {
    id: user._id,
    role: user.role,
    parentId: user._id
  }
}

const handleClientRequest = async (req: Request, blueprint: TokenPayload): Promise<void> => {
  const client = await Client.findOne({ _id: blueprint._id });
  if (!client) {
    throw new Error('Client with given Id does not exist');
  }

  req.auth = {
    id: client._id,
    role: client.role,
    parentId: client.parentId
  }
}

const handleUnregisteredRequest = (req: Request): void => {
  const parentId = req.header('parent-id');
  if (!parentId) {
    throw new Error('ParentId has not been provided in a "parent-id" header for an unregistered user');
  }

  req.auth = {
    id: null,
    role: Role.GUEST,
    parentId: parentId
  }
}