import { NotFound } from 'http-errors';
import { ObjectId } from 'mongodb';
import mongoose, { Error } from 'mongoose';

import { Mock } from '../mocks/Mock';
import { VisitStatus } from './common';
import { Visit, VisitDoc } from './Visit';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/yti-test-visit', {
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

describe('Visit model', () => {
  describe('getOne', () => {
    it('Should find and return visit with given _id', async () => {
      const createdVisit = await Mock.createVisit();

      const visit = await Visit.getOne({ _id: createdVisit._id });

      expect(visit).not.toBeNull();
      expect(visit.date).toEqual(createdVisit.date);
      expect(visit._id.equals(createdVisit._id)).toBe(true);
    });

    it('Should throw CastError for invalid _id as a filter', async () => {
      await Mock.createVisit();
      const notValidId = 'df23';

      await expect(Visit.getOne({ _id: notValidId })).rejects.toThrowError()
    });

    it('Should throw NotFound for valid but non existing _id as a filter', async () => {
      await Mock.createVisit();
      const nonExistingId = '507f1f77bcf86cd799439011';

      await expect(Visit.getOne({ _id: nonExistingId })).rejects.toThrowError(new NotFound('Visit not found'));
    });
  });

  describe('clear', () => {
    it('Should set client to undefined and status for FREE and save document', async () => {
      const visit = await Mock.createVisit();
      visit.client = new ObjectId('507f1f77bcf86cd799439011');
      visit.status = VisitStatus.CONFIRMED;

      await visit.clear();

      expect(visit.status).toEqual(VisitStatus.FREE);
      expect(visit.client).toBeUndefined();
    })
  })
});