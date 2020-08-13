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


export interface UserUniqueData {
  email: string;
  phone: string;
  businessName?: string;
}