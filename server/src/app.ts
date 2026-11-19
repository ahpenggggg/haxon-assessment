import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Db } from './db/db.js';
import { errorHandler, notFoundHandler } from './http/errorHandler.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { requireAuth } from './modules/auth/requireAuth.js';
import type { TokenConfig } from './modules/auth/token.js';
import { createUsersRepository } from './modules/auth/users.repository.js';
import { createLocationsRepository } from './modules/locations/locations.repository.js';
import { createLocationsRouter } from './modules/locations/locations.routes.js';
import { createLocationsService } from './modules/locations/locations.service.js';

export interface AppConfig {
  db: Db;
  token: TokenConfig;
  cookieSecure: boolean;
}

export function createApp({ db, token, cookieSecure }: AppConfig): Express {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const authService = createAuthService(createUsersRepository(db));
  const locationsService = createLocationsService(createLocationsRepository(db));

  app.use('/api/auth', createAuthRouter(authService, { token, cookieSecure }));
  app.use('/api/locations', requireAuth(token.secret), createLocationsRouter(locationsService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
