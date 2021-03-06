import mongoose, { Model, Types } from 'mongoose';
import { Role, Permissions, Status } from './common';

import { options, UserAttrs, UserDoc, User } from './User';
import { hashPassword } from '../utils';


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


AdminSpecificSchema.pre<AdminDoc>('save', async function() {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
});


AdminSpecificSchema.statics.build = (doc: AdminAttrs): AdminDoc => {
  return new Admin({ ...doc, role: Role.ADMIN, status: Status.PENDING });
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