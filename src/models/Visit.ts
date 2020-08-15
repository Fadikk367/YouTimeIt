import  { Document, Model, Types, Schema, model, isValidObjectId } from 'mongoose';
import { UserDoc } from './User';
import { ServiceDoc } from './Service';
import { ClientDoc, ClientData } from './Client';
import { Guest, GuestDoc } from './Guest';


export interface VisitAttrs {
  parentId: UserDoc['_id'];
  date: Date;
  duration: string;
  free?: boolean;
  location: string;
  confirmed?: boolean;
  service?: ServiceDoc['_id'];
  client?: ClientDoc['_id'] | GuestDoc['_id'];
}


export interface VisitDoc extends Document {
  parentId: UserDoc['_id'];
  date: Date;
  duration: string;
  free: boolean;
  location: string;
  confirmed: boolean;
  service?: ServiceDoc['_id'];
  client?: ClientDoc['_id'];
  reserveForRegisteredCLient(client: ClientData, service: ServiceDoc): Promise<void>;
  reserveForUnregisteredClient(client: ClientData): Promise<void>;
}


interface VisitModel extends Model<VisitDoc> {
  build(doc: VisitAttrs): VisitDoc;
  findAllByParentId(parentId: UserDoc['_id']): Promise<VisitDoc[]>;
  findAllByClientId(parentId: ClientDoc['_id']): Promise<VisitDoc[]>;
  findAllFree(): Promise<VisitDoc[]>;
}


const VisitSchema = new Schema({
  parentId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    validate: (value: string): boolean => isValidObjectId(value)
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: String,
    required: true,
  },
  free: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
    required: true,
    max: 80
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  service: {
    type: Types.ObjectId,
    ref: 'Service'
  },
  client: {
    type: Types.ObjectId,
  }
});

VisitSchema.statics.build = (doc: VisitAttrs): VisitDoc => {
  return new Visit(doc);
}

VisitSchema.statics.findAllByParentId = async (parentId: string): Promise<VisitDoc[]> => {
  return await Visit.find({ parentId });
}

VisitSchema.methods.reserveForRegisteredCLient = async function(client: ClientData, service: ServiceDoc): Promise<void> {
  console.log('rezerwacja wizyty dla zarejestrowanego klienta');
}

VisitSchema.methods.reserveForUnregisteredClient = async function(client: ClientData, service: ServiceDoc): Promise<void> {
  console.log('rezerwacja wizyty dla NIEzarejestrowanego klienta');
}


export const Visit =  model<VisitDoc, VisitModel>('Visit', VisitSchema);