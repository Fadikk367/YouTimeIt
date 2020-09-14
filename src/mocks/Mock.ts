import { ClientDoc, Client, ClientAttrs, AdminAttrs, VisitAttrs, BusinessAttrs, ServiceAttrs, AdminDoc, BusinessDoc, Admin, Business, User, VisitDoc, Visit, ServiceDoc, Service } from '../models';
import { Types } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


export class Mock {
  private static businessInstance: BusinessDoc | undefined = undefined;
  private static clientInstance: ClientDoc | undefined = undefined;
  private static adminInstance: AdminDoc | undefined = undefined;
  private static visitInstance: VisitDoc | undefined = undefined;
  private static serviceInsance: ServiceDoc | undefined = undefined;

  static clientAttrs: ClientAttrs = {
    email: 'mock.client@gmail.com',
    firstName: 'Mock',
    lastName: 'Client',
    password: 'password',
    phone: '100100100',
  };

  static adminAttrs: AdminAttrs = {
    email: 'mock.admin@gmail.com',
    firstName: 'Mock',
    lastName: 'Admin',
    password: 'password',
    phone: '200200200',
  };

  static businessAttrs: BusinessAttrs = {
    owner: '',
    description: 'Mock business  description',
    name: 'Mock Business 001',
  };

  static visitAttrs: VisitAttrs = {
    date: new Date('2020-09-10T12:30:00'),
    duration: '30min',
    location: 'Kraków',
  }

  static serviceAttrs: ServiceAttrs = {
    name: 'Mock service',
    description: 'Mock service description',
    duration: '30min',
    price: 120,
  }

  static async createClient(businessId?: Types.ObjectId): Promise<ClientDoc> {
    if (!Mock.clientInstance) {
      const mockClient = Client.build(this.clientAttrs);
  
      if (businessId) {
        mockClient.businessId = businessId;
      } else {
        if (!Mock.businessInstance) {
          Mock.businessInstance = await Mock.createBusiness();
        }
        mockClient.businessId = Mock.businessInstance._id;
      }
  
      Mock.clientInstance = await mockClient.save();
    }
    return Mock.clientInstance;
  }

  static async createAdmin(businessId?: Types.ObjectId): Promise<AdminDoc> {
    if (!Mock.adminInstance) {
      const mockAdmin = Admin.build(this.adminAttrs);
  
      if (businessId) {
        mockAdmin.businessId = businessId;
      } else {
        if (!Mock.businessInstance) {
          Mock.businessInstance = await Mock.createBusiness(mockAdmin._id);
        }
        mockAdmin.businessId = Mock.businessInstance._id;
      }
  
      Mock.adminInstance = await mockAdmin.save();
    }
    return Mock.adminInstance;
  }

  static async createBusiness(adminId?: Types.ObjectId): Promise<BusinessDoc> {
    if (!Mock.businessInstance) {
      let mockBusiness = Business.build(this.businessAttrs);
  
      if (adminId) {
        mockBusiness.owner = adminId;
      } else {
        if (!Mock.adminInstance) {
          Mock.adminInstance = await Mock.createAdmin(mockBusiness._id);
        }
        mockBusiness.owner = Mock.adminInstance._id;
      }
  
      mockBusiness = await mockBusiness.save();
      Mock.businessInstance = mockBusiness;
    }
    return Mock.businessInstance;
  }

  static async createVisit(businessId?: Types.ObjectId): Promise<VisitDoc> {
    if (!Mock.visitInstance) {
      const mockVisit = Visit.build(this.visitAttrs);
      mockVisit.price = 100;
  
      if (businessId) {
        mockVisit.businessId = businessId;
      } else {
        if (!Mock.businessInstance) {
          Mock.businessInstance = await Mock.createBusiness();
        }
        mockVisit.businessId = Mock.businessInstance._id;
      }
  
      Mock.visitInstance = await mockVisit.save();
    }
    return Mock.visitInstance;
  }

  static async createService(businessId?: Types.ObjectId): Promise<ServiceDoc> {
    if (!Mock.serviceInsance) {
      const mockService = Service.build(this.serviceAttrs);
  
      if (businessId) {
        mockService.businessId = businessId;
      } else {
        if (!Mock.businessInstance) {
          Mock.businessInstance = await Mock.createBusiness();
        }
        mockService.businessId = Mock.businessInstance._id;
      }
  
      Mock.serviceInsance = await mockService.save();
    }
    return Mock.serviceInsance;
  }

  static async clear(): Promise<void> {
    try {
      await User.deleteMany({});
      await Business.deleteMany({});
      await Visit.deleteMany({});

      Mock.clientInstance = undefined;
      Mock.adminInstance = undefined;
      Mock.businessInstance = undefined;
      Mock.visitInstance = undefined;
    } catch(err) {
      console.log('An Error occured during mock cleansing');
      console.error(err);
    }
  }
}