import { Admin, Client, AdminDoc, ClientDoc } from '../models';
import jwt from 'jsonwebtoken';
import bcrypt, { compareSync } from 'bcrypt';
import { BadRequest, NotFound } from 'http-errors';
import { generateToken } from '../utils';


export const findAccount = async (email: string): Promise<AdminDoc | ClientDoc> => {
  const client = await Client.findOne({ email });
  if (!client) {
    const user = await Admin.findOne({ email });
    if(!user) {
      throw new NotFound('Invalid email or password');
    }
    return user;
  }
  return client;
}

export const checkPassword = async (password: string, account: AdminDoc | ClientDoc): Promise<void> => {
  const isPasswordCorrect = await bcrypt.compare(password, account.password);
  if (!isPasswordCorrect) 
    throw new NotFound('Invalid email or password');
}

export const generateAuthToken = async (account: AdminDoc | ClientDoc): Promise<string> => {
  const payload = {
    _id: account._id,
    role: account.role,
  };
  return await generateToken(payload, 60*60*24*3);
}