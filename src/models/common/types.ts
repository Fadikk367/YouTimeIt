export enum Plan {
  DEMO = 'DEMO',
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}


export enum Role {
  CLIENT = 'CLIENT',
  USER = 'USER',
  GUEST = 'GUEST'
}

export enum VisitStatus {
  FREE = 'FREE',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED'
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