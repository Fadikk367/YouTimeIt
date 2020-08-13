import { User, Client, UserDoc, ClientDoc } from '../models';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


export const findAccount = async (email: string): Promise<UserDoc | ClientDoc> => {
  const client = await Client.findOne({ email });
  if (!client) {
    const user = await User.findOne({ email });
    if(!user) {
      throw new Error('Invalid email or password');
    }
    return user;
  }
  return client;
}

export const checkPassword = async (password: string, account: UserDoc | ClientDoc): Promise<void> => {
  const isValidPassword = await bcrypt.compare(password, account.password);
  if (!isValidPassword) {
    // Statement about email included for security reasons
    throw new Error('Invalid email or password');
  }
}

export const generateToken = async (account: UserDoc | ClientDoc): Promise<string> => {
  const secret = process.env.TOKEN_SECRET as string;
  const token = await jwt.sign({
    _id: account._id,
    role: account.role
  }, secret, {
    expiresIn: 60*60*24*3
  });

  return token;
}