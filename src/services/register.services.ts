import bcrypt from 'bcrypt';
import { ClientSession, isValidObjectId } from 'mongoose';

import { User, Client, Business, UserDoc, Admin, AdminDoc, ClientAttrs, ClientDoc, AdminAttrs, BusinessAttrs, BusinessDoc } from '../models';
import { EntitiesUniqueData } from '../models/common';
import { hashPassword } from '../utils';

// export const checkIfBusinessAlreadyExists = async (uniqueData: EntitiesUniqueData, session: ClientSession): Promise<void> => {

// }


// export const checkIfUserAlreadyExists = async (uniqueData: EntitiesUniqueData, session: ClientSession): Promise<void> => {
//   const { email, phone } = uniqueData; 
//   let businessName = uniqueData.businessName;

//   const client = await Client.findOne({$or: [{ email }, { phone }]}).session(session);
//   const user = await User.findOne({$or: [{ email }, { phone }, businessName ? { businessName }: {}]}).session(session);

//   if (client || user) {
//     if (client?.email === email || user?.email === email) {
//       throw new Error('An accaunt with given email already exists');
//     }

//     if (client?.phone === phone || user?.phone === phone) {
//       throw new Error('An accaunt with given phone number already exists');
//     }

//     if (user?.businessName == businessName) {
//       throw new Error('An accaunt with given businessName already exists');
//     }
//   }
// }


export const createAdminAccount = async (adminAttrs: AdminAttrs, session: ClientSession): Promise<AdminDoc> => {
  const admin = Admin.build({
    ...adminAttrs,
    password: await hashPassword(adminAttrs.password)
  });

  return  admin;
}


export const createBusinessEnitity = (businessAttrs: BusinessAttrs, session: ClientSession): BusinessDoc => {
  const business = Business.build(businessAttrs);

  return business;
}




