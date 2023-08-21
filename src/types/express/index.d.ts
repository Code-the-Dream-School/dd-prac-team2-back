import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string;
        name: string;
        email: string;
        role: string[];
        iat: number;
        exp: number;
        OAuthToken: string;
      };
    }
  }
}
