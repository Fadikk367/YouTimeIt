import { Request, Response, NextFunction } from 'express';
import { findAccount, checkPassword, generateToken } from '../services/login.services';


interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  }
}

export const login = async (req: LoginRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const account = await findAccount(email);
    await checkPassword(password, account);
    const token = await generateToken(account);
    res.send({ token, account });
  } catch(err) {
    console.error(err);
    next(err);
  }
}