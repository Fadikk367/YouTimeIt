import jwt from 'jsonwebtoken';

const hourInMilisecconds = 1000*60*60;

export async function generateToken<T extends {}>(payload: T, expirationTime: number = hourInMilisecconds): Promise<string> {
  const secret = process.env.TOKEN_SECRET as string;
  const token = await jwt.sign({
    ...payload
  }, secret, {
    expiresIn: expirationTime
  });

  return token;
}