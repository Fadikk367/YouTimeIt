import request from 'supertest';
import mongoose from 'mongoose';
import mongodb from 'mongodb';

import { app, server } from '../app';
import { Mock } from '../mocks/Mock';
import { generateToken } from '../utils';
import { Admin, Business } from '../models';
import { Status } from '../models/common';


beforeAll(async () => {
  const DB_CONNECT_TEST_REMOTE = process.env.DB_CONNECT_TEST_REMOTE as string;
  await mongoose.connect(DB_CONNECT_TEST_REMOTE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
});

beforeEach(async () => {
  await Mock.clear();
});

afterAll(async () => {
  await mongoose.disconnect();
  server.close();
});

describe('register Controller', () => {
  describe('registerAdmin', () => {
    it('Should create admin user and business entity', async () => {
      const response = await request(app)
        .post('/register')
        .send({ 
          adminAttrs: Mock.adminAttrs, 
          businessAttrs: Mock.businessAttrs
        });

      expect(response.status).toEqual(200);
    });

    it('Should toggle account status to confirm', async () => {
      const admin = await Mock.createAdmin();
      const confirmationToken = await generateToken({ userId: admin._id });

      const response = await request(app)
        .patch(`/register/confirm/${confirmationToken}`)
        .send();

      const updatedAdmin = await Admin.findById(admin._id);

      expect(response.status).toEqual(200);
      expect(response.body.message).toEqual('Successfully confirmed account');
      expect(updatedAdmin?.status).toEqual(Status.CONFIRMED);
    });

    it('Should return message about validation error for non unique email address', async () => {
      const admin = await Mock.createAdmin();
      const response = await request(app)
        .post('/register')
        .send({ 
          adminAttrs: Mock.adminAttrs, 
          businessAttrs: Mock.businessAttrs
        });
      const adminCount = (await Admin.find({})).length;
      const businessCount = (await Business.find({})).length;

      expect(response.body).toMatchObject({ messages: `Value: ${Mock.adminAttrs.email} is occupied for <email> field.` });
      expect(adminCount).toEqual(1);
      expect(businessCount).toEqual(1);
    });

    it('Should return message about validation error for non unique phone number', async () => {
      const admin = await Mock.createAdmin();
      const response = await request(app)
        .post('/register')
        .send({ 
          adminAttrs: { ...Mock.adminAttrs, email: 'dffsd@wp.pl' }, 
          businessAttrs: Mock.businessAttrs
        });

      expect(response.body).toMatchObject({ messages: `Value: ${Mock.adminAttrs.phone} is occupied for <phone> field.` })
    });

    it('Should return message about validation error for non unique business name', async () => {
      const admin = await Mock.createBusiness();
      const response = await request(app)
        .post('/register')
        .send({ 
          adminAttrs: { ...Mock.adminAttrs, email: 'dffsd@wp.pl', phone: '333333333' }, 
          businessAttrs: Mock.businessAttrs
        });

      expect(response.body).toMatchObject({ messages: `Value: ${Mock.businessAttrs.name} is occupied for <name> field.` })
    });
  });
});
