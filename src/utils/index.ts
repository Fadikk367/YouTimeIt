import bcrypt from 'bcrypt';
import { Error } from 'mongoose';


export const hashPassword = async (password: string): Promise<string> => {
  if (!password) 
    throw new TypeError('Nie podano hasła lub ma ono niepoprawny format (wymagany łańcuch znaków)');

  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}