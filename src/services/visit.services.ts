import { Request, Response, NextFunction } from 'express';
import { ClientSession } from 'mongoose';
import { Visit, VisitDoc, Service, Guest, ClientData, Client, ClientDoc } from '../models';
import { Role, Auth, VisitStatus } from '../models/common';
import { generateToken } from '../services/common';

const visitConfirmationTime = 1000*60*10;


export const handleReservation = async (visit: VisitDoc, req: Request, session: ClientSession): Promise<void> => {
  const { role, id } = req.auth as Auth;
  const serviceId = req.query.service as string;

  const service = await Service.findOne({ _id: serviceId }).session(session);
  if (!service) throw new Error('Service with given id does not exist');

  if (role === Role.GUEST) {
    await handleGuestReservation(visit, serviceId , req, session);
  } else if (role === Role.CLIENT) {
    await visit.reserve(id as string, serviceId, role, session);
  }
}


export const handleGuestReservation = async (
  visit: VisitDoc, 
  serviceId: string, 
  req: Request, 
  session: ClientSession
): Promise<void> => {
  const userId = req.auth?.parentId as string;
  const role = req.auth?.role as Role;
  const guestData = req.body as ClientData;

  let guest = await Guest.findOne({ $or: [{ email: guestData.email }, { phone: guestData.phone }] }).session(session);
  if (!guest) {
    guest = await Guest.build({ 
      ...guestData,
      parentId: userId
    }).save({ session });
  }

  await visit.reserve(guest._id, serviceId, role, session);
  const confirmationToken = await generateToken({ visitId: visit._id }, visitConfirmationTime);
  console.log(`${req.protocol}://visits/${confirmationToken}/confirm`);

  setTimeout(
    () => checkVisitConfrmation(visit._id), 
    visitConfirmationTime
  );
}


export const handleClientReservation = async (
  visit: VisitDoc, 
  serviceId: string, 
  clientId: string, 
  session: ClientSession
): Promise<void> => {
  const client = await Client.findOne({ _id: clientId}).session(session) as ClientDoc;

  await visit.reserve(clientId, serviceId, Role.CLIENT, session);
  client.visits.push(visit._id);
  await client.save({ session });
}


export const checkVisitConfrmation = async (visitId: string): Promise<void> => {
  const visit = await Visit.findOne({ _id: visitId });

  if (visit) {
    const status  = visit.status;
    if (status !== VisitStatus.CONFIRMED) {
      visit.status = VisitStatus.FREE;
      visit.client = undefined;
      visit.service = undefined;

      await visit.save();
    }
  }
}


export const checkTimingBeforeCancelling = (visit: VisitDoc): void => {
  const { date } = visit;
  const currentTime = new Date();
  if (date.getTime() - currentTime.getTime() <= 24*60*60*1000)
    throw new Error('Sorry, it is too late to cancell your visit');
}