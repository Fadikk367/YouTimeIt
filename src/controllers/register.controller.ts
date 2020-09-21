import { Request, Response, NextFunction} from 'express';
import { AdminDoc, BusinessDoc, User } from '../models';
import { Permissions, Status } from '../models/common';
import mongoose from 'mongoose';

import { 
  createAdminAccount, 
  createBusinessEnitity,
  extractUserIdFromToken,
} from '../services/register.services';
import { generateToken } from '../utils';


interface AdminRegisterAttrs {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  permissions?: Permissions[]
}


interface BusinessRegisterAttrs {
  name: string;
  description: string;
}


interface AdminRegisterRequest extends Request {
  body: {
    adminAttrs: AdminRegisterAttrs;
    businessAttrs: BusinessRegisterAttrs;
  }
}


export const registerAdmin = async (req: AdminRegisterRequest, res: Response, next: NextFunction) => {
  const { adminAttrs, businessAttrs } = req.body;
  const session = await mongoose.startSession();

  // session.startTransaction();

  const admin = createAdminAccount(adminAttrs, session);
  const business = createBusinessEnitity({ ...businessAttrs, owner: admin._id }, session);

  try {
    await session.withTransaction(async () => {
      admin.businessId = business._id;
  
      await admin.save({ session });
      await business.save({ session });
  
      // TODO Send confirmation email
      const confirmationToken = await generateToken({ userId: admin._id });
      // console.log({ confirmationToken });
    });
    
    session.endSession();
    res.json({ admin, business });
  } catch(err) {
    next(err);
  }
}


export const confirmRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const confirmationToken = req.params.token;
  const session = await mongoose.startSession();

  const userId = extractUserIdFromToken(confirmationToken);
  
  try {
    await session.withTransaction(async () => {
      const user = await User.getOne({ _id: userId }, session);
      user.status = Status.CONFIRMED;
      await user.confirm();
    });

    session.endSession();
    res.json({ message: 'Successfully confirmed account' });
  } catch(err) {
    console.log('error catched');
    next(err);
  }
    
}