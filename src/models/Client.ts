import { Document, Model, Types, Schema, model, isValidObjectId } from 'mongoose';
import { UserDoc, User } from './User'; 
import { VisitDoc } from './Visit';
import { Role } from './common';

import { emailValidator } from './common';

export interface ClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface ClientAttrs extends ClientData {
  parentId: UserDoc['_id'],
  password: string
}

export interface ClientDoc extends Document {
  parentId: UserDoc['_id'];
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  visits: VisitDoc['_id'][];
}

interface ClientModel extends Model<ClientDoc> {
  build(doc: ClientAttrs): ClientDoc;
}

const ClientSchema = new Schema({
  parentId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    validate: (value: string): boolean => isValidObjectId(value)
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator:  emailValidator }
  },
  password: {
    type: String,
    required: true,
    min: 10,
    max: 1024
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: Role.CLIENT,
    enum: Object.keys(Role)
  },
  visits: {
    type: [String],
    default: []
  }
});

ClientSchema.statics.build = (doc: ClientAttrs): ClientDoc => {
  return new Client(doc);
}

export const Client = model<ClientDoc, ClientModel>('Client', ClientSchema);