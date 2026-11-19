import bcrypt from 'bcryptjs';
import { HttpError } from '../../http/httpError.js';
import type { Credentials } from './auth.schemas.js';
import type { User, UsersRepository } from './users.repository.js';

const BCRYPT_COST = 10;

export function createAuthService(users: UsersRepository) {
  return {
    async register({ email, password }: Credentials): Promise<User> {
      const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
      const user = await users.create(email, passwordHash);
      if (!user) {
        throw new HttpError(409, 'An account with this email already exists.');
      }
      return user;
    },

    async login({ email, password }: Credentials): Promise<User> {
      const record = await users.findByEmail(email);
      const valid = record ? await bcrypt.compare(password, record.passwordHash) : false;
      if (!record || !valid) {
        throw new HttpError(401, 'Incorrect email or password.');
      }
      return { id: record.id, email: record.email };
    },

    async getUser(id: string): Promise<User> {
      const user = await users.findById(id);
      if (!user) {
        throw new HttpError(401, 'Your session has expired. Please log in again.');
      }
      return user;
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
