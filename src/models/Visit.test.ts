import { BadRequest, Gone, NotFound, Unauthorized } from 'http-errors';
import { ObjectId } from 'mongodb';
import mongoose  from 'mongoose';

import { Mock } from '../mocks/Mock';
import { ClientDoc } from './Client';
import { Status, VisitStatus } from './common';
import { ServiceDoc } from './Service';
import { Visit } from './Visit';

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

  describe('getSingleVisit', () => {
    it('Should find and return visit with given _id', async () => {
      const createdVisit = await Mock.createVisit();

      const visit = await Visit.getSingleVisit(createdVisit._id);

      expect(visit).not.toBeNull();
      expect(visit.date).toEqual(createdVisit.date);
      expect(visit._id.equals(createdVisit._id)).toBe(true);
    });

    it('Should throw CastError for invalid _id as a filter', async () => {
      await Mock.createVisit();
      const notValidId = 'df23';

      await expect(Visit.getSingleVisit(notValidId)).rejects.toThrowError()
    });

    it('Should throw NotFound for valid but non existing _id as a filter', async () => {
      await Mock.createVisit();
      const nonExistingId = '507f1f77bcf86cd799439011';

      await expect(Visit.getSingleVisit(nonExistingId)).rejects.toThrowError(new NotFound('Visit not found'));
    });
    
    it('Should populate client field if proper flag specified in options', async () => {
      const visit = await Mock.createVisit();
      const client = await Mock.createClient();
      visit.client = client._id;
      await visit.save();

      const foundVisit = await Visit.getSingleVisit(visit._id, { extendClient: true });
      let populatedClient = (foundVisit.client as unknown) as ClientDoc;

      expect(foundVisit._id).toEqual(visit._id);
      expect(populatedClient.firstName).toEqual(client.firstName);
      expect(populatedClient.lastName).toEqual(client.lastName);
      expect(populatedClient._id).toEqual(client._id);
      expect(populatedClient.email).toEqual(client.email);
    });

    it('Should populate service field if proper flag specified in options', async () => {
      const visit = await Mock.createVisit();
      const service = await Mock.createService();
      visit.service = service._id;
      await visit.save();

      const foundVisit = await Visit.getSingleVisit(visit._id, { extendService: true });
      let populatedService = (foundVisit.service as unknown) as ServiceDoc;
      
      expect(foundVisit._id).toEqual(visit._id);
      expect(populatedService.name).toEqual(service.name);
      expect(populatedService._id).toEqual(service._id);
      expect(populatedService.description).toEqual(service.description);
      expect(populatedService.duration).toEqual(service.duration);
    });

    it('Should exec query within given ClientSession', async () => {
      const visit = await Mock.createVisit();
      const session = await mongoose.startSession();

      const foundVisit = await Visit.getSingleVisit(visit._id, { session });
      session.endSession();
      
      expect(foundVisit._id).toEqual(visit._id);
      expect(foundVisit.$session()).not.toBeUndefined();
      expect(foundVisit.$session()).toMatchObject(session);
    });
  });

  describe('setService', () => {
    it('Should set visit.service to serviceId', async () => {
      const visit = await Mock.createVisit();
      const service = await Mock.createService();

      visit.setService(service);

      expect(visit.service).toEqual(service._id);
    });
  });

  describe('cancel', () => {
    it('Should set visit.status to FREE and unset client field', async () => {
      const visit = await Mock.createVisit();
      const client = await Mock.createClient();
      const dateAfterTomorrow = new Date();
      dateAfterTomorrow.setDate(dateAfterTomorrow.getDate() + 2);
      visit.client = client._id;
      visit.status = VisitStatus.CONFIRMED;
      visit.date = dateAfterTomorrow;

      await visit.cancel();

      expect(visit.client).toBeUndefined();
      expect(visit.status).toEqual(VisitStatus.FREE);
    });

    it('Should throw Gone error for too late visit cancel attempt', async () => {
      const visit = await Mock.createVisit();
      const client = await Mock.createClient();
      const dateBefore24Hours = new Date();
      dateBefore24Hours.setDate(dateBefore24Hours.getDate() + 1);
      dateBefore24Hours.setHours(dateBefore24Hours.getHours() - 1);
      visit.client = client._id;
      visit.status = VisitStatus.CONFIRMED;
      visit.date = dateBefore24Hours;

      await expect(visit.cancel()).rejects.toThrowError(new Gone('Sorry, time remaining to your visit is too short to cancel it'));
    });
  });

  describe('clear', () => {
    it('Should set client to undefined, status for FREE and save document', async () => {
      const visit = await Mock.createVisit();
      visit.client = new ObjectId('507f1f77bcf86cd799439011');
      visit.status = VisitStatus.CONFIRMED;

      await visit.clear();

      expect(visit.status).toEqual(VisitStatus.FREE);
      expect(visit.client).toBeUndefined();
    });
  });

  describe('addToQueue', () => {
    it('Should add registered client with confirmed account to a queue', async () => {
      const visit = await Mock.createVisit();
      const client = await Mock.createClient();
      client.status = Status.CONFIRMED;
      visit.client = new ObjectId('507f1f77bcf86cd799439011');
      visit.status = VisitStatus.CONFIRMED;

      await visit.addToQueue(client);

      expect(visit.queue.length).toBe(1);
      expect(visit.queue[0].equals(client._id)).toBe(true);
    });

    it('Should throw Unauthorized error for user who is not registered client', async () => {
      const visit = await Mock.createVisit();
      const guest = await Mock.createGuest();
      visit.client = new ObjectId('507f1f77bcf86cd799439011');
      visit.status = VisitStatus.CONFIRMED;

      await expect(visit.addToQueue(guest)).rejects.toThrowError(new Unauthorized('Only registered clients are allowed to enter the queue'));
    });

    it('Should throw Unauthorized error for user has not confirmed his account', async () => {
      const visit = await Mock.createVisit();
      const client = await Mock.createClient();
      visit.client = new ObjectId('507f1f77bcf86cd799439011');
      visit.status = VisitStatus.CONFIRMED;

      await expect(visit.addToQueue(client)).rejects.toThrowError(new Unauthorized('Your account has not been confirmed yet'));
    });
  });

  describe('confirm', () => {
    it('Should set visit.status to CONFIRMED', async () => {
      const visit = await Mock.createVisit();
      visit.status = VisitStatus.PENDING;

      await visit.confirm();

      expect(visit.status).toEqual(VisitStatus.CONFIRMED);
    });

    it('Should throw BadRequest for confirm attempt for not PENDING visit.status', async () => {
      const visit = await Mock.createVisit();
      visit.status = VisitStatus.FREE;

      await expect(visit.confirm()).rejects.toThrowError(new BadRequest('Cannot confirm non PENDING visit'));
    });
  });
});