import { NextFunction, Request, Response } from 'express';
import { Forbidden } from 'http-errors';
import { Role } from '../models/common';

import { authRole } from './authRole';


describe('Role authentification middleware', () => {
  it('should reject request if user does not exist', () => {
    const next = jest.fn() as NextFunction;
    const req = {
      user: undefined
    };

    expect(() => authRole(Role.ADMIN)(req as Request, {} as Response, next)).toThrowError(Forbidden);
  });

  it('should proceed and call next', () => {
    const next = jest.fn();
    const req = {
      user: {
        role: Role.ADMIN
      }
    }
    authRole(Role.ADMIN)(req as Request, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should reject request with invalid or missing user role value', () => {
    const next = jest.fn();
    const req = {
      user: {
        role: 'Adm'
      }
    };
    const middleware = authRole(Role.ADMIN);

    expect(() => middleware(
      req as Request, 
      {} as Response, 
      next as NextFunction
    )).toThrowError(Forbidden);
  });
})