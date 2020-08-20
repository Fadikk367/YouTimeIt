import mongoose, { Document, Types, Model, model } from 'mongoose';
import { Plan } from './common';
import { User } from './User';
import { ServiceDoc } from './Service';

interface BusinessAttrs {
  name: string;
  owner: string;
  description: string;
}


interface BusinessDoc extends Document {
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

interface BusinessModel extends Model<BusinessDoc> {
  build(doc: BusinessAttrs): BusinessDoc;
}

const BusinessSchema = new mongoose.Schema<BusinessDoc>({
  name: {
    type: String,
    unique: true,
    required: true
  },
  owner: {
    type: Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  employees: {
    type: [{ type: Types.ObjectId, ref: 'Admin' }],
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


const Business = model<BusinessDoc, BusinessModel>('Business', BusinessSchema);