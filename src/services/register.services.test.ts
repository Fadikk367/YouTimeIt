import { BadRequest } from 'http-errors';
import mongoose, { mongo } from 'mongoose';

import { Mock } from '../mocks/Mock';
import { Role } from '../models/common';
import { generateToken } from '../utils';

import { 
  extractUserIdFromToken,
  createAdminAccount,
  createBusinessEnitity,
} from './register.services';


beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/yti-test-register-services', {
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

describe('Register services', () => {
  describe('extractUserIdFromToken', () => {
    it('Should return userId for valid confirmation token', async () => {
      const user = await Mock.createClient();
      const token = await generateToken({ userId: user._id, role: user.role });

      let userId = extractUserIdFromToken(token);

      expect(() => extractUserIdFromToken(token)).not.toThrowError();
      expect(user._id.equals(userId)).toBe(true);
    });

    it('Should throw BadRequest error for invalid confirmation token', async () => {
      const token = await generateToken({ userId: undefined });
      
      expect(() => extractUserIdFromToken(token)).toThrowError(new BadRequest('Invalid Confirmation Token'));
    });
  });
});