import type { Request, RequestHandler } from 'express';
import { HttpError } from '../../http/httpError.js';
import { verifyAccessToken } from './token.js';

export const AUTH_COOKIE_NAME = 'access_token';

const UNAUTHENTICATED_MESSAGE = 'Please log in to continue.';

export function requireAuth(jwtSecret: string): RequestHandler {
  return (req, _res, next) => {
    const token: unknown = req.cookies?.[AUTH_COOKIE_NAME];
    const userId = typeof token === 'string' ? verifyAccessToken(token, jwtSecret) : null;
    if (!userId) {
      throw new HttpError(401, UNAUTHENTICATED_MESSAGE);
    }
    req.userId = userId;
    next();
  };
}

export function getAuthUserId(req: Request): string {
  if (!req.userId) {
    throw new HttpError(401, UNAUTHENTICATED_MESSAGE);
  }
  return req.userId;
}
