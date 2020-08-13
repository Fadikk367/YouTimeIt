import { Request, Response, NextFunction } from 'express';
import { findAccount, checkPassword, generateToken } from '../services/login.services';


interface LoginRequest extends Request {
  body: {
    email: string;
    passowrd: string;
  }
}

export const login = async (req: LoginRequest, res: Response, next: NextFunction) => {
  const { email, passowrd } = req.body;

  try {
    const account = await findAccount(email);
    await checkPassword(passowrd, account);
    const token = await generateToken(account);
    res.send({ token, account });
  } catch(err) {
    console.error(err);
    next(err);
  }
}