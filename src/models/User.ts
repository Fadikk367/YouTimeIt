import mongoose, { Document, Model, Types, ClientSession } from 'mongoose';
import { NotFound } from 'http-errors';
import { Role, Status } from './common';


export const options = {
  discriminatorKey: '_type',
  timestamps: true
};


export interface UserAttrs {
  businessId?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}


export interface UserDoc extends Document {
  businessId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  confirm(): void;
}


export interface UserModel extends Model<UserDoc> {
  build(doc: UserAttrs): UserDoc;
  getOne(filters: Object, session?: ClientSession): Promise<UserDoc>;
}


const UserSchema = new mongoose.Schema<UserDoc>({
  businessId: {
    type: mongoose.Types.ObjectId,
    ref: 'Business',
    required: [true, 'TUTAJ MUSI BYC ID BOIZNESU']
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: [true, 'Imię jest wymagane']
  },
  lastName: {
    type: String,
    required: [true, 'Nazwisko jest wymagane']
  },
  phone: {
    type: String,
    required: [true, 'Numer telefony jest wymagany'],
    unique: true
  },
  role: {
    type: String,
    default: Role.GUEST,
    enum: Object.keys(Role)
  },
  status: {
    type: String,
    default: Status.UNREGISTERED,
    enum: Object.keys(Status),
  },
}, options);

UserSchema.statics.build = (doc: UserAttrs): UserDoc => {
  return new User({ ...doc, role: Role.GUEST });
}

UserSchema.statics.getOne = async function (filters: Object, session?: ClientSession): Promise<UserDoc> {
  const query = User.findOne(filters);

  if (session)
    query.session(session);

  const visit = await query.exec();
  if (!visit)
    throw new NotFound('Visit not found');

  return visit;
}

UserSchema.methods.confirm = async function () {
  this.status = Status.CONFIRMED;
  await this.save();
}

export const User =  mongoose.model<UserDoc, UserModel>('User', UserSchema);
