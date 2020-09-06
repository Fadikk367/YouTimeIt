import bcrypt from 'bcrypt';
import { ClientSession, isValidObjectId } from 'mongoose';
import jwt from 'jsonwebtoken';

import { Business, Admin, AdminDoc, AdminAttrs, BusinessAttrs, BusinessDoc } from '../models';
import { hashPassword } from '../utils';
import { BadRequest } from 'http-errors';


export const extractUserIdFromToken = (token: string) => {
  const secret = process.env.TOKEN_SECRET as string;
  const payload = jwt.verify(token, secret) as { userId: string };
  
  const userId = payload.userId;
  if (!userId)
    throw new BadRequest('Invalid Confirmation Token');

  return userId;
}


export const createAdminAccount = async (adminAttrs: AdminAttrs, session: ClientSession): Promise<AdminDoc> => {
  const admin = Admin.build({
    ...adminAttrs,
  });

  return  admin;
}


export const createBusinessEnitity = (businessAttrs: BusinessAttrs, session: ClientSession): BusinessDoc => {
  const business = Business.build(businessAttrs);

  return business;
}




