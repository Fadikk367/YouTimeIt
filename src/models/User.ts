import mongoose, { Document, Model, Types } from 'mongoose';
import { Role } from './common';


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
  createdAt: Date;
  updatedAt: Date;
}


export interface UserModel extends Model<UserDoc> {
  build(doc: UserAttrs): UserDoc;
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
}, options);

UserSchema.statics.build = (doc: UserAttrs): UserDoc => {
  return new User({ ...doc, role: Role.GUEST });
}

export const User =  mongoose.model<UserDoc, UserModel>('User', UserSchema);
