import 'express';

interface Auth {
  id: string | null;
  role: Role;
  parentId: string; 
}

declare module 'express' {
  export interface Request {
    auth?: Auth;
  }
}