import { Request, Response, NextFunction} from 'express';
import { UserAttrs, ClientAttrs } from '../models';
import mongoose from 'mongoose';

import { 
  checkIfUserAlreadyExists, 
  createUserAccount, 
  createClientAccount 
} from '../services/register.services';


interface UserRegisterRequest extends Request {
  body: UserAttrs
}

interface ClientRegisterRequest extends Request {
  body: ClientAttrs
}

export const registerUser = async (req: UserRegisterRequest, res: Response, next: NextFunction) => {
  const userData = req.body;
  const session = await mongoose.startSession();
  await session.startTransaction();

  try {
    await checkIfUserAlreadyExists(userData, session);
    const user = await createUserAccount(userData, session);
    await session.commitTransaction();
    session.endSession();
    res.json(user);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const registerClient = async (req: ClientRegisterRequest, res: Response, next: NextFunction) => {
  const clientData = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await checkIfUserAlreadyExists(clientData, session);
    const client = await createClientAccount(clientData, session);
    await session.commitTransaction();
    session.endSession();
    res.json(client);
  } catch(err) {
    console.error(err);
    next(err);
  }
}