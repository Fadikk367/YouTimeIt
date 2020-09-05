import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECCONDS_IN_DAY = 60*60*24;


export const hashPassword = async (password: string): Promise<string> => {
  if (!password) 
    throw new TypeError('Nie podano hasła lub ma ono niepoprawny format (wymagany łańcuch znaków)');

  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export const generateToken = async (payload: Object, expirationTime = 60*60): Promise<string> => {
  const secret = process.env.TOKEN_SECRET as string;
  const token = await jwt.sign(
    payload, 
    secret, {
    expiresIn: expirationTime,
  });

  return token;
}