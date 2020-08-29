import { Request, Response, NextFunction} from 'express';
import { ClientAttrs, Visit, Service, ServiceAttrs, UserDoc, VisitAttrs } from '../models';
import mongoose from 'mongoose';

import { createClientAccount } from '../services/business.services';
import { NotFound } from 'http-errors';


interface ClientRegisterRequest extends Request {
  body: ClientAttrs;
}

interface VisitFilters {
  service?: string;
  page?: number;
  count?: number;
}


export const registerClient = async (req: ClientRegisterRequest, res: Response, next: NextFunction) => {
  const clientAttrs = req.body;
  const businessId = req.params.businessId;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    const client = await createClientAccount({ ...clientAttrs, businessId }, session);
    await client.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json(client);
  } catch(err) {
    next(err);
  }
}


export const getVisits = async (req: Request, res: Response, next: NextFunction) => {
  const businessId = req.params.businessId;
  const filters = req.query as VisitFilters;

  try {
    const visits = await Visit.getVisits(businessId, filters);
    res.json(visits);
  } catch(err) {
    next(err);
  }
}


export const getServices = async (req: Request, res: Response, next: NextFunction) => {
  const businessId = req.params.businessId;

  try {
    const services = await Service.find({ businessId });
    res.json(services);
  } catch(err) {
    next(err);
  }
}


export const bookVisit = async (req: Request, res: Response, next: NextFunction) => {

}


export const cancelVisit = async (req: Request, res: Response, next: NextFunction) => {
  
}


export const moveVisit = async (req: Request, res: Response, next: NextFunction) => {
  
}