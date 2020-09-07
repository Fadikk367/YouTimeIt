import mongoose from 'mongoose';
import { Gone, Unauthorized } from 'http-errors';

import { Mock } from '../mocks/Mock';
import { VisitStatus } from '../models/common';

import { 
  checkTimingBeforeCancelling,
  cehckIfVisitStatusIsPending,
  extractVisitIdFromToken,
  checkClientCompatibility,
} from './visit.services';


beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/yti-test-visit-services', {
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


describe.only('Visit services', () => {
  describe('checkTimingBeforeCancelling', () => {
    it('Should throw Gone error for cancel attempt less than 24h before visit', async () => {
      const visit = await Mock.createVisit();
      const visitDate = new Date();
      visitDate.setHours(visitDate.getHours() + 23);
      visit.date = visitDate;

      expect(() => checkTimingBeforeCancelling(visit)).toThrow(new Gone('Sorry, it is too late to cancel your visit'));
    });

    it('Should not throw anything for cancel attempt moe than 24h before visit', async () => {
      const visit = await Mock.createVisit();
      const visitDate = new Date();
      visitDate.setHours(visitDate.getHours() + 25);
      visit.date = visitDate;

      expect(() => checkTimingBeforeCancelling(visit)).not.toThrowError();
    });
  });

  describe('cehckIfVisitStatusIsPending', () => {
    it('Should throw Gone error for FREE visit status (time is up)', async () => {
      const visit = await Mock.createVisit();
      visit.status = VisitStatus.FREE;

      expect(() => cehckIfVisitStatusIsPending(visit)).toThrow(new Gone('You run out of time, verification failed'));
    });

    it('Should not throw anything for correct - PENDING visit status check', async () => {
      const visit = await Mock.createVisit();
      visit.status = VisitStatus.PENDING

      expect(() => cehckIfVisitStatusIsPending(visit)).not.toThrowError();
    });
  });
});