import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Visit, VisitAttrs } from '../models';
import jwt from 'jsonwebtoken';

import { handleReservation, checkTimingBeforeCancelling } from '../services/visit.services';
import { generateToken } from '../services/common';
import { VisitStatus } from '../models/common';


interface MyRequest<T> extends Request<{}, {}, T> {}

const visitConfirmationTime = 1000*60*10;

export const getSingleVisit= async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parentId = req.auth?.parentId as string;
  const visitId = req.params.visitId;

  try {
    const visit = await Visit.findOne({ parentId: parentId, _id: visitId });
    res.json(visit);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const getAllVisits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parentId = req.auth?.parentId as string;

  try {
    const visits = await Visit.findAllByParentId(parentId);
    res.json(visits);
  } catch(err) {
    console.error(err);
    next(err);
  }
}

export const createVisit = async (req: MyRequest<VisitAttrs>, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.id as string;

  try {
    const visit = Visit.build({ 
      ...req.body,
      parentId: userId
    });

    const createdVisit= await visit.save();
    res.json(createdVisit);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const updateVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.parentId;
  const visitId = req.params.visitId;

  try {
    // const deletedSerive = Service.findOneAndUpdate({ parentId: userId, _id: visitId }, {});
    console.log('visit update request');
    res.json({ });
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const deleteVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.parentId as string;
  const visitId = req.params.visitId;

  try {
    const deletedVisit = await Visit.findOneAndDelete({ parentId: userId, _id: visitId });
    res.json({ deletedVisit, message: 'Successfully deleted visit' });
  } catch(err) {
    console.error(err);
    next(err);
  }
}

export const reserveVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.parentId as string;
  const visitId = req.params.visitId;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let visit = await Visit.findOne({ _id: visitId, parentId: userId }).session(session);
    if (visit) {
      await handleReservation(visit, req, session);
      visit = await visit.save({ session: session });
    } else {
      throw new Error('Visit with given Id number does not exist');
    }
    await session.commitTransaction();
    session.endSession();

    res.json({ reservedVisit: visit, message: 'Successfully reserved visit'});
  } catch(err) {
    console.error(err);
    next(err);
  }
}

export const cancelVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.parentId as string;
  const clientId = req.auth?.id as string;
  const visitId = req.params.visitId as string;
  console.log({ visitId, clientId });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const visit = await Visit.findOne({ _id: visitId }).session(session);
    console.log({ visit })
    if (visit && visit.client?.equals(clientId)) {
      checkTimingBeforeCancelling(visit);
      await visit.clear(session);
    } else {
      throw new Error('Visit with given Id number does not exist or You have not reserved it');
    }
    await session.commitTransaction();
    session.endSession();
    res.json({ message: 'Reservation has been canceled'});
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const confirmVisit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const confirmationToken = req.params.token;
  const secret = process.env.TOKEN_SECRET as string;

  try {
    const payload = jwt.verify(confirmationToken, secret) as { visitId: string };
    const visitId = payload.visitId;

    const visit = await Visit.findOne({ _id: visitId });
    if (visit && visit.status === VisitStatus.PENDING) {
      visit.status = VisitStatus.CONFIRMED;
      await visit.save();
    } else {
      throw new Error('It seems you run out of time, please try again');
    }
    res.status(200).json({ message: 'Your visit has been successfully confirmed!' });
  } catch(err) {
    console.error(err);
    next(err);
  }
}