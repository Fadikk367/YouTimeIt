import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { MongoError } from 'mongodb';
import { InternalServerError, BadRequest, isHttpError } from 'http-errors';

export interface DuplicateKeyError extends MongoError {
  keyValue: { [key: string]: string }
}


export const errorParser = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (isHttpError(err)) {
    console.log('already http error');
    next(err);
  } else {
    switch (err.name) {
      case 'TypeError':
        next(new BadRequest(err.message));
      case 'ValidationError':
        handleValidationError(err as mongoose.Error.ValidationError, next);
        break;
      case 'MongoError':
        if (isDuplicateKeyError(err as MongoError))
          handleDuplicateKeyError(err as DuplicateKeyError, next);
        else
          next(new InternalServerError('An unexpected databse error occured'));
        break;
      default:
        next(new InternalServerError('An unexpected error occured')); 
        break;
    }
  }
};


export const handleValidationError = (err: mongoose.Error.ValidationError, next: NextFunction) => {
  let validationMessage = '';
  for (let key in err.errors) 
    validationMessage += `${key}: ${err.errors[key]};`;
  
  next(new BadRequest(validationMessage));
}


export const handleDuplicateKeyError = (err: DuplicateKeyError, next: NextFunction) => {
  let message: string = '';
  for (let key in err.keyValue) {
    message += `Value: ${err.keyValue[key]} is occupied for <${key}> field.`
  }

  next(new BadRequest(message));
}


export const isDuplicateKeyError = (err: MongoError): boolean => {
  return (err.name === 'MongoError' && err.code === 11000)
}


export const isValidationError = (err: mongoose.Error): boolean => {
  return err.name === 'ValidationError';
}


