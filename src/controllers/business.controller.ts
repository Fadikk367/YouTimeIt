import { Request, Response, NextFunction} from 'express';
import { ClientAttrs, Visit, Service, ServiceAttrs, UserDoc, VisitAttrs } from '../models';
import mongoose from 'mongoose';

import { createClientAccount } from '../services/business.services';


interface ClientRegisterRequest extends Request {
  body: ClientAttrs;
}

interface ServiceCreateRequest extends Request {
  body: ServiceAttrs;
}

interface VisitCreateRequest extends Request {
  body: VisitAttrs;
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


export const createService = async (req: ServiceCreateRequest, res: Response, next: NextFunction) => {
  const user = req.user as UserDoc;

  try {
    const service = await Service.build({ ...req.body, businessId: user.businessId });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch(err) {
    next(err);
  }
}


export const createVisit = async (req: VisitCreateRequest, res: Response, next: NextFunction) => {
  const user = req.user as UserDoc;
  const visitAttrs = req.body.visitAttrs;
  const serviceAttrs = req.body.serviceAttrs;

  try {
    const visit = await Visit.build({ ...visitAttrs, businessId: user.businessId });
    const createdVisit = await visit.save();
    res.status(201).json(createdVisit);
  } catch(err) {
    next(err);
  }
}