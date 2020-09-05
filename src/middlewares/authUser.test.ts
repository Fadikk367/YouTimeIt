import { Request, Response, NextFunction } from 'express';
import jwt, { JsonWebTokenError} from 'jsonwebtoken';
import { Unauthorized, BadRequest } from 'http-errors';
import mongoose, { mongo } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import { generateToken } from '../utils';

// import { Role } from '../models/common';
// import { User, Client } from '../models';
import httpMock from 'node-mocks-http';
import { authUser } from './authUser';
import { UserDoc, ClientDoc, User, Client, Admin, Business, AdminDoc, BusinessDoc } from '../models';

let req: Request;
let res: Response;
let next: NextFunction;
let mockClient: ClientDoc;
let mockAdmin: AdminDoc;
let mockBusiness: BusinessDoc;
let mockAuthToken: string;

beforeAll(async () => {
 // TODO:
 // - connect to test database 
 // - create sample user
 // - login sample user to obtain auth-token

 const DB_CONNECT_TEST = process.env.DB_CONNECT_TEST as string;

  mongoose.connect(
    DB_CONNECT_TEST, 
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }, 
    () => {
      // console.log(`Connected to the database`);
    }
  );

  mockAdmin = Admin.build({
    email: 'test.admin@wp.pl',
    password: 'password',
    firstName: 'Admin',
    lastName: 'AdminS',
    phone: '111 111 111',
  });

  mockBusiness = Business.build({
    name: 'TEST CORP',
    description: 'test business description',
    owner: mockAdmin._id,
  });
  mockAdmin.businessId = mockBusiness._id;

  mockClient = Client.build({
    email: 'test.client@wp.pl',
    password: 'password',
    firstName: 'Client',
    lastName: 'ClientS',
    phone: '222 222 222',
    businessId: mockBusiness._id,
  });
  try {
    await mockClient.save();
    await mockAdmin.save();
    await mockBusiness.save();
  } catch(err) {
    console.log('mock creation failed');
    console.log(err);
  }

  mockAuthToken = await generateToken({ role: mockClient.role, _id: mockClient._id });
});

beforeEach(async () => {
  req = httpMock.createRequest();
  res = httpMock.createResponse();
  next = jest.fn();
});

afterAll(async () => {
  // TODO:
  // - drop test collections
  // - disconnect from the database
  // mongoose.connection.db.dropDatabase(() => {
  //   console.log('Test database dropped');
  // })
  try {
    await User.deleteMany({});
    await Business.deleteMany({});
  } catch(err) {
    console.log(err);
  }

  await mongoose.disconnect();
});

describe('User authentification middleware', () => {
  it('Should pass and leave req.user property undefined for guest request', async () => {
    await authUser(req, res, next);

    expect(next).toBeCalledTimes(1);
    expect(req.user).toBeUndefined();
  });

  it('Should throw Err for invalid token', async () => {
    req.headers['auth-token'] = 'fdfdf';

    await authUser(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new JsonWebTokenError('jwt malformed'));
  });

  it('Should attach authentificated user to on req.user property and proceed', async () => {
    req.headers['auth-token'] = mockAuthToken;

    await authUser(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).not.toBeUndefined();
    expect(req.user?._id).toEqual(mockClient._id);
    expect(req.user?.firstName).toEqual(mockClient.firstName);
    expect(req.user?.lastName).toEqual(mockClient.lastName);
    expect(req.user?.email).toEqual(mockClient.email);
    expect(req.user?.phone).toEqual(mockClient.phone);
  });
});