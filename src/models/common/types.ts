import { Request } from 'express';

export enum Plan {
  DEMO = 'DEMO',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}


export enum Role {
  CLIENT = 'CLIENT',
  USER = 'USER',
  GUEST = 'GUEST',
  ADMIN = 'ADMIN'
}

export enum VisitStatus {
  FREE = 'FREE',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED'
}

export enum Permissions {
  VISITS_CREATE = 'VISITS_CREATE',
  VISITS_READ = 'VISITS_READ',
  VISITS_UPDATE = 'VISITS_UPDATE',
  VISITS_DELETE = 'VISITS_DELETE'
}


export interface EntitiesUniqueData {
  email: string;
  phone: string;
  businessName?: string;
}

export interface Auth {
  id: string | null;
  role: Role;
  parentId: string; 
}

export interface RegisteredUser {
  businessId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}


export interface MyRequest<T> extends Request {
  body: T;
}