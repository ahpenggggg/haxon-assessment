import { Router, type CookieOptions, type Response } from 'express';
import { loginSchema, registerSchema } from './auth.schemas.js';
import type { AuthService } from './auth.service.js';
import { AUTH_COOKIE_NAME, getAuthUserId, requireAuth } from './requireAuth.js';
import { signAccessToken, type TokenConfig } from './token.js';
import type { User } from './users.repository.js';

export interface AuthRouterConfig {
  token: TokenConfig;
  cookieSecure: boolean;
}

export function createAuthRouter(authService: AuthService, config: AuthRouterConfig): Router {
  const router = Router();

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.cookieSecure,
    path: '/api',
  };

  function startSession(res: Response, user: User): void {
    res.cookie(AUTH_COOKIE_NAME, signAccessToken(user.id, config.token), {
      ...cookieOptions,
      maxAge: config.token.expiresInSeconds * 1000,
    });
  }

  router.post('/register', async (req, res) => {
    const user = await authService.register(registerSchema.parse(req.body ?? {}));
    startSession(res, user);
    res.status(201).json({ user });
  });

  router.post('/login', async (req, res) => {
    const user = await authService.login(loginSchema.parse(req.body ?? {}));
    startSession(res, user);
    res.json({ user });
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, cookieOptions);
    res.status(204).end();
  });

  router.get('/me', requireAuth(config.token.secret), async (req, res) => {
    const user = await authService.getUser(getAuthUserId(req));
    res.json({ user });
  });

  return router;
}
