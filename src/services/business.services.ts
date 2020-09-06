import { ClientSession, isValidObjectId } from 'mongoose';
import { Client, ClientAttrs, ClientDoc, Business, Guest, UserDoc } from '../models';
import { hashPassword } from '../utils';
import { Request } from 'express';
import { Visit, VisitDoc, Service} from '../models';
import { Role, Auth, VisitStatus } from '../models/common';
import { generateToken } from '../services/common';
import { EmailMessage, GmailMailer } from '../utils/mailer';
import { GuestAttrs } from 'models/Guest';

const visitConfirmationTime = 1000*60*10;
const MILISECONDS_IN_DAY = 1000*60*60*24


export const createClientAccount = async (clientAttrs: ClientAttrs, session: ClientSession): Promise<ClientDoc> => {
  if (!isValidObjectId(clientAttrs.businessId)) {
    throw new Error('Invalid businessId - given path parameter is not valid ObjectId');
  }

  const business = await Business.findOne({ _id: clientAttrs.businessId }).session(session);
  if (!business) {
    throw new Error('Invalid businessId - Business with such _id does not exist');
  }

  const client = Client.build({
    ...clientAttrs,
  });

  return client;
}


export const handleReservation = async (visit: VisitDoc, req: Request, session: ClientSession): Promise<void> => {
  const { role, _id } = req.user as UserDoc;
  const serviceId = req.query.service as string;

  const service = await Service.findOne({ _id: serviceId }).session(session);
  if (!service) throw new Error('Service with given id does not exist');

  if (role === Role.GUEST) {
    await handleGuestReservation(visit, req, session);
  } else if (role === Role.CLIENT) {
    await handleClientReservation(visit, _id as string, session);
  }
}


export const handleGuestReservation = async (
  visit: VisitDoc, 
  req: Request, 
  session: ClientSession
): Promise<void> => {
  const businessId = req.params.businessId as string;
  const guestData = req.body as GuestAttrs;

  let guest = await Guest.findOne({ $or: [{ email: guestData.email }, { phone: guestData.phone }] }).session(session);
  if (!guest) {
    guest = await Guest.build({ 
      businessId,
      ...guestData
    }).save({ session });
  }

  await visit.reserve(guest, session);
  const confirmationToken = await generateToken({ visitId: visit._id }, visitConfirmationTime);
  console.log(`${req.protocol}://localhost:5000/visits/confirm/${confirmationToken}`);

  const message = new EmailMessage(
    'Potwierdzenie wizyty',
    'adrian.furman.dev@gmail.com',
    ['fadikk367@gmail.com'],
    `${req.protocol}://localhost:5000/visits/confirm${confirmationToken}`
  );

  await GmailMailer.send(message);

  setTimeout(
    () => checkVisitConfrmation(visit._id), 
    visitConfirmationTime
  );
}


export const handleClientReservation = async (
  visit: VisitDoc, 
  clientId: string, 
  session: ClientSession
): Promise<void> => {
  const client = await Client.findOne({ _id: clientId}).session(session) as ClientDoc;

  await visit.reserve(client, session);
  client.visits.push(visit._id);
  await client.save({ session });
}


export const checkVisitConfrmation = async (visitId: string): Promise<void> => {
  const visit = await Visit.findOne({ _id: visitId });

  if (visit) {
    if (visit.status !== VisitStatus.CONFIRMED) {
      visit.status = VisitStatus.FREE;
      visit.client = undefined;
      visit.service = undefined;

      await visit.save();
    }
  }
}