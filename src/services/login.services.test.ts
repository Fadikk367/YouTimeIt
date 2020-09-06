import { NotFound } from 'http-errors';
import mongoose, { mongo } from 'mongoose';

import { Mock } from '../mocks/Mock';
import { Role } from '../models/common';

import { 
  findAccount,
  checkPassword,
  generateAuthToken,
} from './login.services';


beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/youtimeit-test', {
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
});


describe('Login services', () => {
  describe('findAccount', () => {
    it('Should throw NotFound for invalid email', async () => {
      const client = await Mock.createClient();
      const invalidEmail = 'not.existing.email@gmail.com';

      await expect(findAccount(invalidEmail)).rejects.toThrow(new NotFound('Invalid email or password'))
    });

    it('Should find and return client entity for valid client email', async () => {
      const client = await Mock.createClient();
      const existingClientEmail = Mock.clientAttrs.email;

      const clientAccout = await findAccount(existingClientEmail);

      expect(clientAccout).not.toBeUndefined();
      expect(clientAccout.email).toEqual(existingClientEmail);
      expect(clientAccout.role).toEqual(Role.CLIENT);
    });

    it('Should find and return admin entity for valid admin email', async () => {
      const admin = await Mock.createAdmin();
      const existingAdminEmail = Mock.adminAttrs.email;

      const adminAccout = await findAccount(existingAdminEmail);

      expect(adminAccout).not.toBeUndefined();
      expect(adminAccout.email).toEqual(existingAdminEmail);
      expect(adminAccout.role).toEqual(Role.ADMIN);
    });
  });

  describe('checkPassword', () => {
    it('Should throw BadRequest error for invalid password', async () => {
      const account = await Mock.createAdmin();
      const invalidPassword = 'invalid password';

      await expect(checkPassword(invalidPassword, account)).rejects.toThrow(new NotFound('Invalid email or password'));
    });

    it('Should not throw anything and proceed for valid password', async () => {
      const account = await Mock.createAdmin();
      const validPassword = Mock.adminAttrs.password;

      await expect(checkPassword(validPassword, account)).resolves.not.toThrowError();
    });
  });
})