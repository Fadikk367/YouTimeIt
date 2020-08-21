import  { Document, Model, Types, Schema, model, isValidObjectId, ClientSession } from 'mongoose';
import { UserDoc } from './User';
import { ServiceDoc } from './Service';
import { ClientDoc, ClientData } from './Client';
import { Guest, GuestDoc } from './Guest';
import { VisitStatus, Role } from './common';


export interface VisitAttrs {
  parentId: UserDoc['_id'];
  date: Date;
  duration: string;
  location: string;
  status?: VisitStatus;
  service?: ServiceDoc['_id'];
  client?: UserDoc['_id'];
}


export interface VisitDoc extends Document {
  parentId: UserDoc['_id'];
  date: Date;
  duration: string;
  location: string;
  status: VisitStatus;
  service?: ServiceDoc['_id'];
  client?: ClientDoc['_id'];
  queue: string[];
  reserve(clientId: string, serviceId: string, role: Role, session: ClientSession): Promise<void>;
  clear(session?: ClientSession): Promise<void>
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
    ref: 'Business',
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
  location: {
    type: String,
    required: true,
    max: 80
  },
  status: {
    type: String,
    default: VisitStatus.FREE,
    enum: Object.keys(VisitStatus)
  },
  queue: {
    type: [{
      client: { type: Types.ObjectId, ref: 'Client'}
    }],
    default: []
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

VisitSchema.methods.reserve = async function(
  clientId: string, 
  serviceId: string, 
  role: Role,
  session: ClientSession
): Promise<void> {
  console.log(`rezerwacja wizyty dla ${role === Role.GUEST ? 'NIE' : ''}zarejestrowanego klienta`);
  this.client = clientId;
  this.service = serviceId;

  if (role === Role.GUEST) this.status = VisitStatus.PENDING;
  else if (role === Role.CLIENT) this.status = VisitStatus.CONFIRMED;

  // await this.save({ session });
}

VisitSchema.methods.clear = async function(session?: ClientSession): Promise<void> {
  this.client = undefined;
  this.service = undefined;
  this.status = VisitStatus.FREE;

  await this.save(session ? { session } : {});
}


VisitSchema.methods.addToQueue = async function(client: ClientData): Promise<void> {
  console.log('dodanie do kolejki zarejestrowanego klienta');
}


export const Visit =  model<VisitDoc, VisitModel>('Visit', VisitSchema);