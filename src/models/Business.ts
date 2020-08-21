import mongoose, { Document, Types, Model, model } from 'mongoose';
import { Plan } from './common';
import { User } from './User';
import { ServiceDoc } from './Service';

export interface BusinessAttrs {
  name: string;
  owner: string;
  description: string;
}


export interface BusinessDoc extends Document {
  name: string;
  owner: string;
  description: string;
  employees: string[];
  plan: Plan;
  payments: {
    date: Date;
    amount: Number;
    plan: String;
  }[],
}

export interface BusinessModel extends Model<BusinessDoc> {
  build(doc: BusinessAttrs): BusinessDoc;
}

const BusinessSchema = new mongoose.Schema<BusinessDoc>({
  name: {
    type: String,
    unique: true,
    required: [true, 'Nawza biznesu jest wymagana']
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Opis biznesu jest wymagany']
  },
  employees: {
    type: [{ type: mongoose.Types.ObjectId, ref: 'Admin' }],
    ref: 'Admin',
    default: []
  },
  plan: {
    type: String,
    default: Plan.DEMO
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

BusinessSchema.statics.build = function(doc: BusinessAttrs): BusinessDoc {
  return new Business(doc);
}


export const Business = model<BusinessDoc, BusinessModel>('Business', BusinessSchema);