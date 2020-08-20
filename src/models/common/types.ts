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


export interface UserUniqueData {
  email: string;
  phone: string;
  businessName?: string;
}

export interface Auth {
  id: string | null;
  role: Role;
  parentId: string; 
}