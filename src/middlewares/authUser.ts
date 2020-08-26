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
  const token = req.header('auth-token');
  console.log('auth user');
  try {
    if (token) {
      const secret = process.env.TOKEN_SECRET as string;
      const blueprint = await jwt.verify(token, secret) as TokenPayload;
      const { role } = blueprint;

      if (Object.values(Role).includes(role)) {
        await handleUserAuthentification(req, blueprint);
      }
    } else {
      req.user = undefined;
    }

    next();
  } catch(err) {
    console.error(err);
    next(err);
  }
}


const handleUserAuthentification = async (req: Request, blueprint: TokenPayload): Promise<void> => {
  const user = await User.findOne({ _id: blueprint._id });
  if (!user) 
    throw new Unauthorized();

  console.log(user.businessId, req.params);
  if (!user.businessId.equals( req.params.businessId))
    throw new BadRequest();

  req.user = user;
}



// const handleUserRequest = async (req: Request, blueprint: TokenPayload): Promise<void> => {
//   const user = await User.findOne({ _id: blueprint._id });
//   if (!user) {
//     throw new Error('User with given Id does not exist');
//   }

//   req.auth = {
//     id: user._id,
//     role: user.role,
//     parentId: user._id
//   }
// }


// const handleClientRequest = async (req: Request, blueprint: TokenPayload): Promise<void> => {
//   const client = await Client.findOne({ _id: blueprint._id });
//   if (!client) {
//     throw new Error('Client with given Id does not exist');
//   }

//   req.auth = {
//     id: client._id,
//     role: client.role,
//     parentId: client.parentId
//   }
// }

// const handleUnregisteredRequest = async (req: Request): Promise<void> => {
//   const parentId = req.header('parent-id');
//   const user = await User.findOne({ _id: parentId });
  
//   if (!user) {
//     throw new Error('ParentId has not been provided in a "parent-id" header for an unregistered user');
//   }

//   req.auth = {
//     id: null,
//     role: Role.GUEST,
//     parentId: user._id
//   }
// }
