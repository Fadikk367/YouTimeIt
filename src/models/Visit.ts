import  { Document, Model, Types, Schema, model, isValidObjectId, ClientSession } from 'mongoose';
import { UserDoc } from './User';
import { ServiceDoc } from './Service';
import { ClientDoc } from './Client';
import { VisitStatus, Role, Status } from './common';
import { NotFound, Gone, Unauthorized, BadRequest } from 'http-errors';
import { Session } from 'inspector';

const MILISECONDS_IN_DAY = 1000*60*60*24;


interface VisitFilters {
  service?: string;
  page?: number;
  limit?: number;
}


export interface VisitAttrs {
  businessId?: UserDoc['_id'];
  date: Date;
  duration: string;
  location: string;
  status?: VisitStatus;
  service?: ServiceDoc['_id'];
  client?: UserDoc['_id'];
}


export interface VisitDoc extends Document {
  businessId: Types.ObjectId;
  date: Date;
  duration: string;
  location: string;
  status: VisitStatus;
  price: number;
  service?: Types.ObjectId;
  client?: Types.ObjectId;
  queue: Types.ObjectId[];
  setService(service: ServiceDoc): void;
  reserve(user: UserDoc, session: ClientSession): Promise<VisitDoc>;
  addToQueue(client: UserDoc): Promise<void>;
  clear(session?: ClientSession): Promise<void>;
  cancel(session?: ClientSession): Promise<void>;
  confirm(): Promise<void>;
  calculateRemainingTime(): number;
}


interface VisitModel extends Model<VisitDoc> {
  build(doc: VisitAttrs): VisitDoc;
  getOne(filters: Object, session?: ClientSession): Promise<VisitDoc>;
  findByBusinessId(businessId: UserDoc['_id']): Promise<VisitDoc[]>;
  findByClientId(clientid: ClientDoc['_id']): Promise<VisitDoc[]>;
  findAllFree(): Promise<VisitDoc[]>;
  getVisits(businessId: string, filters?: VisitFilters): Promise<VisitDoc[]>;
  getSingleVisit(visitId: string, options?: { extendService?: boolean, extendClient?: boolean, session?: ClientSession}): Promise<VisitDoc>;
}


const VisitSchema = new Schema<VisitDoc>({
  businessId: {
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
  price: {
    type: Number,
    required: true
  },
  service: {
    type: Types.ObjectId,
    ref: 'Service'
  },
  client: {
    type: Types.ObjectId,
    ref: 'User'
  }
});


VisitSchema.statics.build = (doc: VisitAttrs): VisitDoc => {
  return new Visit(doc);
}


VisitSchema.statics.findByBusinessId = async (businessId: string): Promise<VisitDoc[]> => {
  return await Visit.find({ businessId });
}

VisitSchema.statics.findByClientId = async (clientId: string): Promise<VisitDoc[]> => {
  return await Visit.find({ client: clientId });
}



VisitSchema.statics.getSingleVisit = async (visitId: string, options?: { extendService?: boolean, extendClient?: boolean, session?: ClientSession }): Promise<VisitDoc> => {
  const query = Visit.findById(visitId);

  if (options?.session)
    query.session(options.session);

  if (options?.extendClient) 
    query.populate('client');
  
  if (options?.extendService) 
    query.populate('service', '_id name description duration')

    
  const visit = await query.exec();

  if (!visit) 
    throw new NotFound('Visit not found');

  return visit;
}


VisitSchema.statics.getVisits = async function(businessId: string, filters: VisitFilters): Promise<VisitDoc[]> {
  const query = Visit.find();
  query.where({ businessId });

  if (filters.service) 
    query.where({ service: filters.service});
  
  if (filters.limit)
   query.limit(filters.limit);

  if (filters.page)
    query.skip(filters.page * (filters.limit || 10));

  return await query.exec();
}


VisitSchema.statics.getOne = async function (filters: Object, session?: ClientSession): Promise<VisitDoc> {
  const query = Visit.findOne(filters);

  if (session)
    query.session(session);

  const visit = await query.exec();
  if (!visit)
    throw new NotFound('Visit not found');

  return visit;
}


VisitSchema.methods.setService = function(service: ServiceDoc): void {
  this.service = service._id;
}


VisitSchema.methods.reserve = async function(
  user: UserDoc, 
  session: ClientSession
): Promise<VisitDoc> {
  console.log(`rezerwacja wizyty dla ${user.role === Role.GUEST ? 'NIE' : ''}zarejestrowanego klienta`);
  this.client = user._id;

  if (user.role === Role.GUEST) this.status = VisitStatus.PENDING;
  else if (user.role === Role.CLIENT) this.status = VisitStatus.CONFIRMED;

  return await this.save({ session });
}


VisitSchema.methods.clear = async function(session?: ClientSession): Promise<void> {
  this.client = undefined;
  this.status = VisitStatus.FREE;

  await this.save(session ? { session } : {});
}


VisitSchema.methods.cancel = async function(session?: ClientSession): Promise<void> {
  const remainingTime = this.calculateRemainingTime();
  if (remainingTime < MILISECONDS_IN_DAY)
    throw new Gone('Sorry, time remaining to your visit is too short to cancel it');
  
  this.status = VisitStatus.FREE;
  this.client = undefined;

  await this.save({ session });
}


VisitSchema.methods.addToQueue = async function(client: UserDoc, session?: ClientSession): Promise<void> {
  if (client.role !== Role.CLIENT)
    throw new Unauthorized('Only registered clients are allowed to enter the queue');

  if (client.status !== Status.CONFIRMED)
    throw new Unauthorized('Your account has not been confirmed yet');

  if (this.client === client._id)
    return;

  this.queue.push(client._id);
  await this.save({ session });
}


VisitSchema.methods.confirm = async function(): Promise<void> {
  if (this.status !== VisitStatus.PENDING)
    throw new BadRequest('Cannot confirm non PENDING visit')

  this.status = VisitStatus.CONFIRMED;
  await this.save();
}


VisitSchema.methods.calculateRemainingTime = function(): number {
  const currentTime = new Date();
  const timeDifference = this.date.getTime() - currentTime.getTime();
  return timeDifference;
}


export const Visit = model<VisitDoc, VisitModel>('Visit', VisitSchema);