import { Request, Response, NextFunction} from 'express';
import { ClientAttrs } from '../models';
import mongoose from 'mongoose';

import { createClientAccount } from '../services/business.services';


interface ClientRegisterRequest extends Request {
  body: ClientAttrs
}


export const registerClient = async (req: ClientRegisterRequest, res: Response, next: NextFunction) => {
  const clientAttrs = req.body;
  const businessId = req.params.businessId;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    const client = await createClientAccount({ ...clientAttrs, businessId }, session);
    await client.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(client);
  } catch(err) {
    next(err);
  }
}