import { Request, Response, NextFunction} from 'express';
import { AdminAttrs, BusinessAttrs, ClientAttrs } from '../models';
import { Permissions } from '../models/common';
import mongoose from 'mongoose';

import { 
  createAdminAccount, 
  createBusinessEnitity,
} from '../services/register.services';


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

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const admin = await createAdminAccount(adminAttrs, session);
    const business = createBusinessEnitity({ ...businessAttrs, owner: admin._id }, session);
    admin.businessId = business._id;

    await admin.save({ session });
    await business.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ admin, business });
  } catch(err) {
    next(err);
  }
}