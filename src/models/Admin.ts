import mongoose, { Model, Types } from 'mongoose';
import { Role, Permissions } from './common';

import { options, UserAttrs, UserDoc, User } from './User';


export interface AdminAttrs extends UserAttrs {
  password: string;
  permissions?: Permissions[]
}


export interface AdminDoc extends UserDoc {
  password: string;
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


export const Admin = User.discriminator<AdminDoc, AdminModel>('Admin', AdminSpecificSchema);