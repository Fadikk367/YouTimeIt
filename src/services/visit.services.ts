import { VisitDoc, UserDoc } from '../models';
import { VisitStatus } from '../models/common';
import { Gone, Unauthorized } from 'http-errors';
import jwt from 'jsonwebtoken';

const visitConfirmationTime = 1000*60*10;
const MILISECONDS_IN_DAY = 1000*60*60*24;


export const checkTimingBeforeCancelling = (visit: VisitDoc): void => {
  const { date } = visit;
  const currentTime = new Date();
  if (date.getTime() - currentTime.getTime() <= MILISECONDS_IN_DAY)
    throw new Gone('Sorry, it is too late to cancel your visit');
}


export const cehckIfVisitStatusIsPending = (visit: VisitDoc): void => {
  if (visit.status !== VisitStatus.PENDING)
    throw new Gone('You run out of time, verification failed');
}


export const extractVisitIdFromToken = (token: string) => {
  const secret = process.env.TOKEN_SECRET as string;
  const payload = jwt.verify(token, secret) as { visitId: string };
  return payload.visitId;
}


export const checkClientCompatibility = (visit: VisitDoc, clientId: string) => {
  if (!visit.client?.equals(clientId))
    throw new Unauthorized('Your are not the owner of this visit');
}