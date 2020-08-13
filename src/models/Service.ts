import { Document, Model, Types, Schema, model, isValidObjectId } from 'mongoose';
import { UserDoc } from './User';

export interface ServiceAttrs {
  parentId: UserDoc['_id'],
  name: string,
  description: string,
  price: number,
  duration: string,
  active?: boolean
}


export interface ServiceDoc extends Document {
  parentId: UserDoc['_id'],
  name: string,
  description: string,
  price: number,
  duration: string,
  active?: boolean
}


interface ServiceModel extends Model<ServiceDoc> {
  build(doc: ServiceAttrs): ServiceDoc;
  findAllByParentId(parentId: string): Promise<ServiceDoc[]>;
}


const ServiceSchema = new Schema({
  parentId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
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

ServiceSchema.statics.findAllByParentId = async (parentId: string): Promise<ServiceDoc[]> => {
  return Service.find({ parentId }).exec();
}

export const Service =  model<ServiceDoc, ServiceModel>('Service', ServiceSchema);