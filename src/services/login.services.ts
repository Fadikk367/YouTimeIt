import { Admin, Client, AdminDoc, ClientDoc } from '../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { BadRequest } from 'http-errors';


export const findAccount = async (email: string): Promise<AdminDoc | ClientDoc> => {
  const client = await Client.findOne({ email });
  if (!client) {
    const user = await Admin.findOne({ email });
    if(!user) {
      throw new BadRequest('Invalid email or password');
    }
    return user;
  }
  return client;
}

export const checkPassword = async (password: string, account: AdminDoc | ClientDoc): Promise<void> => {
  const isValidPassword = await bcrypt.compare(password, account.password);
  if (!isValidPassword) {
    // Statement about email included for security reasons
    throw new BadRequest('Invalid email or password');
  }
}

export const generateToken = async (account: AdminDoc | ClientDoc): Promise<string> => {
  const secret = process.env.TOKEN_SECRET as string;
  const token = await jwt.sign({
    _id: account._id,
    role: account.role
  }, secret, {
    expiresIn: 60*60*24*3
  });

  return token;
}