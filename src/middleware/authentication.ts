import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express-serve-static-core';
import { UnauthenticatedError } from '../errors';
import { ACCESS_TOKEN_SECRET } from '../config';

export interface jwtPayload {
  userId: string;
  name: string;
  email: string;
  role: string[];
  iat: number;
  exp: number;
  OAuthToken: string;
}

const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Invalid token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET!) as jwtPayload;

    req.user = payload;

    next();
  } catch (err) {
    throw new UnauthenticatedError('Invalid token');
  }
};

export default auth;
