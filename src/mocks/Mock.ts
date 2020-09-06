import { ClientDoc, Client, ClientAttrs, AdminAttrs, BusinessAttrs, AdminDoc, BusinessDoc, Admin, Business, User } from '../models';
import { Types } from 'mongoose';


export class Mock {
  private static businessInstance: BusinessDoc | undefined = undefined;
  private static clientInstance: ClientDoc | undefined = undefined;
  private static adminInstance: AdminDoc | undefined = undefined;

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

  static async clear(): Promise<void> {
    try {
      await User.deleteMany({});
      await Business.deleteMany({});

      Mock.clientInstance = undefined;
      Mock.adminInstance = undefined;
      Mock.businessInstance = undefined;
    } catch(err) {
      console.log('An Error occured during mock cleansing');
      console.error(err);
    }
  }
}