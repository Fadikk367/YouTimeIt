import 'express';
import { Role } from '../models/common';
import { UserDoc } from 'models';

interface Auth {
  id: string | null;
  role: Role;
  parentId: string; 
}

declare module 'express' {
  export interface Request {
    auth?: Auth;
    user?: UserDoc;
  }
}