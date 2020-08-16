import bcrypt from 'bcrypt';
import { ClientSession, isValidObjectId } from 'mongoose';

import { User, Client, UserDoc, UserAttrs, ClientAttrs, ClientDoc } from '../models';
import { UserUniqueData } from '../models/common';


export const checkIfUserAlreadyExists = async (uniqueData: UserUniqueData, session: ClientSession): Promise<void> => {
  const { email, phone } = uniqueData; 
  let businessName = uniqueData.businessName;

  const client = await Client.findOne({$or: [{ email }, { phone }]}).session(session);
  const user = await User.findOne({$or: [{ email }, { phone }, businessName ? { businessName }: {}]}).session(session);

  if (client || user) {
    if (client?.email === email || user?.email === email) {
      throw new Error('An accaunt with given email already exists');
    }

    if (client?.phone === phone || user?.phone === phone) {
      throw new Error('An accaunt with given phone number already exists');
    }

    if (user?.businessName == businessName) {
      throw new Error('An accaunt with given businessName already exists');
    }
  }
}


export const createUserAccount = async (userData: UserAttrs, session: ClientSession): Promise<UserDoc> => {
  const user = User.build({
    ...userData,
    password: await hashPassword(userData.password)
  });

  const createdUser = user.save({ session: session });
  return createdUser;
}


export const createClientAccount = async (clientData: ClientAttrs, session: ClientSession): Promise<ClientDoc> => {
  if (!isValidObjectId(clientData.parentId)) {
    throw new Error('Invalid parentId - given string is not valid ObjectId');
  }

  const user = await User.findOne({ _id: clientData.parentId }).session(session);
  if (!user) {
    throw new Error('Invalid parentId - User with such _id does not exist');
  }

  const client = Client.build({
    ...clientData,
    password: await hashPassword(clientData.password)
  });

  const createdClient = client.save({ session: session });
  return createdClient;
}

const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}