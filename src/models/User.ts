import { Document, Model, Schema, model } from 'mongoose';
import { emailValidator } from './common';
import { Role, Plan } from './common';


export interface UserAttrs {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  plan?: Plan;
}


export interface UserDoc extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  phone: string;
  role: Role;
  plan: Plan;
  permissions: string[];
  payments: {
    date: Date;
    amount: Number;
    plan: String;
  }[],
  createdAt: Date;
  updatedAt: Date;
}


export interface UserModel extends Model<UserDoc> {
  build(doc: UserAttrs): UserDoc;
}


const UserSchema = new Schema({
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
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
    max: 60
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: Role.USER,
    enum: Object.keys(Role)
  },
  plan: {
    type: String,
    default: Plan.DEMO
  },
  permissions: {
    type: [String],
    default: []
  },
  payments: {
    type: [{
      date: Date,
      amount: Number,
      plan: String
    }],
    default: []
  }
}, {
  timestamps: true
});

UserSchema.statics.build = (doc: UserAttrs): UserDoc => {
  return new User(doc);
}

export const User =  model<UserDoc, UserModel>('User', UserSchema);