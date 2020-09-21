import { Request, Response, NextFunction } from 'express';
import { Service, User, ServiceAttrs, UserDoc } from '../models';
import { NotFound } from 'http-errors';

interface MyRequest<T> extends Request<{}, {}, T> {}


export const getServiceById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const parentId = req.user?.businessId;
  const serviceId = req.params.serviceId;

  try {
    const service = await Service.findOne({ businessId: parentId, _id: serviceId });
    res.json(service);
  } catch(err) {
    console.error(err);
    next(err);
  }
}


export const createService = async (req: MyRequest<ServiceAttrs>, res: Response, next: NextFunction) => {
  const user = req.user as UserDoc;

  try {
    const service = await Service.build({ ...req.body, businessId: user.businessId });
    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch(err) {
    next(err);
  }
}


export const updateService = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.businessId;
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
  const userId = req.user?.businessId;
  const serviceId = req.params.serviceId;

  try {
    const deletedSerive = await Service.findOneAndDelete({ parentId: userId, _id: serviceId });
    if (!deleteService)
      throw new NotFound();

    res.json({ deletedSerive, message: 'Successfully deleted service' });
  } catch(err) {
    console.error(err);
    next(err);
  }
}