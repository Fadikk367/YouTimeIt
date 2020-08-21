import { Document, Model, Types, Schema, model, isValidObjectId } from 'mongoose';
import { UserDoc } from './User'; 
import { VisitDoc } from './Visit';
import { Role } from './common';
import { emailValidator } from './common';


export interface GuestAttrs extends ClientData {
  parentId: UserDoc['_id'],
}

export interface GuestDoc extends Document {
  parentId: UserDoc['_id'];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  visits: VisitDoc['_id'][];
}

interface GuestModel extends Model<GuestDoc> {
  build(doc: GuestAttrs): GuestDoc;
}

const GuestSchema = new Schema({
  parentId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    validate: (value: string): boolean => isValidObjectId(value)
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator:  emailValidator }
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: Role.GUEST,
    enum: Object.keys(Role)
  },
  visits: {
    type: [{ type: Types.ObjectId, ref: 'Visit'}],
    default: []
  }
});

GuestSchema.statics.build = (doc: GuestAttrs): GuestDoc => {
  return new Guest(doc);
}

export const Guest = model<GuestDoc, GuestModel>('Guest', GuestSchema);