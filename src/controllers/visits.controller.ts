import { Request, Response, NextFunction } from 'express';
import { Visit, User, ServiceAttrs, VisitAttrs } from '../models';
import { Role } from '../models/common';

interface MyRequest<T> extends Request<{}, {}, T> {}



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