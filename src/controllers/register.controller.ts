import { Request, Response, NextFunction} from 'express';
import { User } from '../models';
import { Permissions, Status } from '../models/common';
import mongoose from 'mongoose';

import { 
  createAdminAccount, 
  createBusinessEnitity,
  extractUserIdFromToken,
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

    // TODO Send confirmation email

    await session.commitTransaction();
    session.endSession();

    res.json({ admin, business });
  } catch(err) {
    next(err);
  }
}


export const confirmRegistration = async (req: Request, res: Response, next: NextFunction) => {
  const confirmationToken = req.params.token;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const userId = extractUserIdFromToken(confirmationToken);

    await session.withTransaction(async () => {
      const user = await User.getOne({ _id: userId }, session);
      user.status = Status.CONFIRMED;
      await user.confirm();
    });

    res.json({ message: 'Successfully confirmed account' });
  } catch(err) {
    next(err);
  } finally {
    session.endSession();
  }
}