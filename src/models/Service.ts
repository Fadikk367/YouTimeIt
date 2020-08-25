import { Document, Model, Types, Schema, model, isValidObjectId } from 'mongoose';
import { UserDoc } from './User';

export interface ServiceAttrs {
  businessId?: string,
  name: string,
  description: string,
  price: number,
  duration: string,
  active?: boolean
}


export interface ServiceDoc extends Document {
  businessId: string,
  name: string,
  description: string,
  price: number,
  duration: string,
  active?: boolean
}


interface ServiceModel extends Model<ServiceDoc> {
  build(doc: ServiceAttrs): ServiceDoc;
  findAllBybusinessId(businessId: string): Promise<ServiceDoc[]>;
}


const ServiceSchema = new Schema<ServiceDoc>({
  businessId: {
    type: Types.ObjectId,
    ref: 'Nusiness',
    required: true,
    validate: (value: string): boolean => isValidObjectId(value)
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: false
  },
  active: {
    type: Boolean,
    default: true
  }
});

ServiceSchema.statics.build = (doc: ServiceAttrs): ServiceDoc => {
  return new Service(doc);
}

ServiceSchema.statics.findAllBybusinessId = async (businessId: string): Promise<ServiceDoc[]> => {
  return await Service.find({ businessId });
}

export const Service =  model<ServiceDoc, ServiceModel>('Service', ServiceSchema);