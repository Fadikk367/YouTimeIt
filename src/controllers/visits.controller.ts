import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Visit, Service, VisitAttrs, UserDoc, VisitDoc } from '../models';
import { VisitStatus } from '../models/common';
import { NotFound } from 'http-errors';
import jwt from 'jsonwebtoken';
import { 
  checkTimingBeforeCancelling, 
  cehckIfVisitStatusIsPending, 
  extractVisitIdFromToken, 
  checkClientCompatibility 
} from '../services/visit.services';


interface MyRequest<T> extends Request<{}, {}, T> {}

interface VisitCreateRequest extends Request {
  body: VisitAttrs;
}

const visitConfirmationTime = 1000*60*10;


export const getVisitById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const visitId = req.params.visitId;
  const { extend } = req.query;

  try {
    const visit = await Visit.getSingleVisit(visitId, { extendService: true });
    res.json(visit);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const createVisit = async (req: MyRequest<VisitAttrs>, res: Response, next: NextFunction) => {
  const user = req.user as UserDoc;
  const visitAttrs = req.body;
  const serviceId = req.query.service;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const visit = await Visit.build({ ...visitAttrs, businessId: user.businessId });
    const service = await Service.findOne({ _id: serviceId, businessId: user.businessId }).session(session);
    if(!service) 
      throw new NotFound('Such service does not exist');
    
    visit.setService(service);
    const createdVisit = await visit.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(createdVisit);
  } catch(err) {
    next(err);
  }
}


export const updateVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const admin = req.user as UserDoc;
  const visitId = req.params.visitId;

  try {
    const visit = await Visit.getOne({ _id: visitId });
    const { serviceId, date } = req.body;
    if (serviceId) visit.service = serviceId;
    if (date) visit.date = date;
    const updatedVisit = await visit.save();
    res.json({ updatedVisit });
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const deleteVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const admin = req.user as UserDoc;
  const visitId = req.params.visitId;

  try {
    const deletedVisit = await Visit.findOneAndDelete({ _id: visitId, businessId: admin.businessId });
    res.json({ deletedVisit, message: 'Successfully deleted visit' });
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const cancelVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const clientId = req.user?._id as string;
  const visitId = req.params.visitId as string;
  const session = await mongoose.startSession();
  
  try {
    await session.withTransaction(async () => {
      const visit = await Visit.getOne({ _id: visitId }, session);
      checkClientCompatibility(visit, clientId);
      await visit.cancel(session);
    });

    res.json({ message: 'Reservation has been canceled'});
  } catch(err) {
    next(err);
  } finally {
    session.endSession();
  }
}


export const confirmVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const confirmationToken = req.params.token;
  const session = await mongoose.startSession();

  try {
    const visitId = extractVisitIdFromToken(confirmationToken);

    await session.withTransaction(async () => {
      const visit = await Visit.getOne({ _id: visitId }, session);
      cehckIfVisitStatusIsPending(visit);
      await visit.confirm();
    });

    res.status(200).json({ message: 'Your visit has been successfully confirmed.' });
  } catch(err) {
    next(err);
  } finally {
    session.endSession();
  }
}