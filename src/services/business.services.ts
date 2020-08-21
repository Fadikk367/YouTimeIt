import { ClientSession, isValidObjectId } from 'mongoose';

import { Client, ClientAttrs, ClientDoc, Business } from '../models';
import { hashPassword } from '../utils';


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
    password: await hashPassword(clientAttrs.password)
  });

  return client;
}