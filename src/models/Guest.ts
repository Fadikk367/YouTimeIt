import { Model, Types, Schema } from 'mongoose';
import { UserAttrs, User, UserDoc } from './User'; 
import { Role } from './common';



export interface GuestAttrs extends UserAttrs { }

export interface GuestDoc extends UserDoc {
  visits: Types.ObjectId[];
}

interface GuestModel extends Model<GuestDoc> {
  build(doc: GuestAttrs): GuestDoc;
}

const GuestSchema = new Schema({
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

export const Guest = User.discriminator<GuestDoc, GuestModel>('Guest', GuestSchema);