import mongoose, { Model, Types } from 'mongoose';
import { Role, Status } from './common';

import { options, UserAttrs, UserDoc, User } from './User';

export interface ClientAttrs extends UserAttrs {
  password: string;
}


export interface ClientDoc extends UserDoc {
  password: string;
  visits: string[];
  addVisit(visitId: string): void;
}


export interface ClientModel extends Model<ClientDoc> {
  build(doc: ClientAttrs): ClientDoc;
}


const ClientSpecificSchema = new mongoose.Schema<ClientDoc>({
  password: {
    type: String,
    required: true
  },
  visits: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'Visit' }],
    default: []
  }
}, options);


ClientSpecificSchema.statics.build = (doc: ClientAttrs): ClientDoc => {
  return new Client({ ...doc, role: Role.CLIENT, status: Status.PENDING });
}


ClientSpecificSchema.methods.addVisit = function (visitId: string): void {
  this.visits.push(visitId);
}


export const Client = User.discriminator<ClientDoc, ClientModel>('Client', ClientSpecificSchema);