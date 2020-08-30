import { Request, Response, NextFunction } from 'express';
import { Unauthorized } from 'http-errors';

export const authBusiness = async (req: Request, res: Response, next: NextFunction) => {
  const businessId = req.params.businessId;
  if (req.user && !req.user.businessId.equals(businessId))
    throw new Unauthorized('This user is not registered for this business');
  next();
}