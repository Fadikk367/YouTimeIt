import { Request, Response, NextFunction } from 'express';
import { Service, User, ServiceAttrs } from '../models';
import { Role } from '../models/common';

interface MyRequest<T> extends Request<{}, {}, T> {}



export const getSingleService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parentId = req.auth?.parentId as string;
  const serviceId = req.params.serviceId;

  try {
    const service = await Service.findOne({ parentId: parentId, _id: serviceId });
    res.json(service);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const getAllServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parentId = req.auth?.parentId as string;

  try {
    const services = await Service.findAllByParentId(parentId);
    res.json(services);
  } catch(err) {
    console.error(err);
    next(err);
  }
}

export const createService = async (req: MyRequest<ServiceAttrs>, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.id as string;

  try {
    const service = Service.build({ 
      ...req.body,
      parentId: userId
    });

    const createdService = await service.save();
    res.json(createdService);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.parentId;
  const serviceId = req.params.serviceId;

  try {
    // const deletedSerive = Service.findOneAndUpdate({ parentId: userId, _id: serviceId }, {});
    console.log('service update request');
    res.json({ });
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const deleteService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.auth?.parentId as string;
  const serviceId = req.params.serviceId;

  try {
    const deletedSerive = await Service.findOneAndDelete({ parentId: userId, _id: serviceId });
    res.json({ deletedSerive, message: 'Successfully deleted service' });
  } catch(err) {
    console.error(err);
    next(err);
  }
}