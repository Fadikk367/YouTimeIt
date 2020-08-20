import mongoose, { Document, Model, Schema, model, Types } from 'mongoose';
import { Visit } from './Visit';
import { Role, Permissions } from './common';


const options = {
  discriminatorKey: '_type',
  timestamps: true
};


export interface UserAttrs {
  businessId: string;
  email: string;
  firstName: string;
  lastName: string;
}


export interface UserDoc extends Document {
  businessId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}


export interface UserModel extends Model<UserDoc> {
  build(doc: UserAttrs): UserDoc;
}


const UserSchema = new mongoose.Schema<UserDoc>({
  businessId: {
    type: Types.ObjectId,
    ref: 'Business',
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
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

// <===================================================>

export interface ClientAttrs extends UserAttrs {
  password: string;
  phone: string;
}


export interface ClientDoc extends UserDoc {
  password: string;
  phone: string;
  visits: string[];
  addVisit(visitId: string): void;
}


export interface ClientModel extends Model<ClientDoc> {
  build(doc: ClientAttrs): ClientDoc;
}


const ClientSpecificSchema = new mongoose.Schema<ClientDoc>({
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    validate: (value: string): boolean => true
  },
  visits: {
    type: [{ type: Types.ObjectId, ref: 'Visit' }],
    default: []
  }
}, options);


ClientSpecificSchema.statics.build = (doc: ClientAttrs): ClientDoc => {
  return new Client({ ...doc, role: Role.CLIENT });
}


ClientSpecificSchema.methods.addVisit = function (visitId: string): void {
  this.visits.push(visitId);
}


const Client = User.discriminator<ClientDoc, ClientModel>('Client', ClientSpecificSchema);


// <================================================>

export interface AdminAttrs extends UserAttrs {
  password: string;
  phone: string;
  permissions?: Permissions[]
}


export interface AdminDoc extends UserDoc {
  password: string;
  phone: string;
  permissions: Permissions[];
  addPermissions(permissions: Permissions[]): void;
  removePermissions(permissions: Permissions[]): void;
}


export interface AdminModel extends Model<AdminDoc> {
  build(doc: AdminAttrs): AdminDoc;
}


const AdminSpecificSchema = new mongoose.Schema<AdminDoc>({
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    validate: (value: string): boolean => true
  },
  permissions: {
    type: [String],
    enum: Object.keys(Permissions),
    default: []
  }
}, options);


AdminSpecificSchema.statics.build = (doc: AdminAttrs): AdminDoc => {
  return new Admin({ ...doc, role: Role.ADMIN });
}


AdminSpecificSchema.methods.addPermissions = function (permissions: Permissions[]): void {
  this.permissions = [...this.permissions, ... permissions];
}


AdminSpecificSchema.methods.removePermissions = function (permissions: Permissions[]): void {
  this.permissions = this.permissions.filter(currentPermission => (
    permissions.findIndex(permission => currentPermission !== permission)
  ));
}


const Admin = User.discriminator<AdminDoc, AdminModel>('Admin', AdminSpecificSchema);