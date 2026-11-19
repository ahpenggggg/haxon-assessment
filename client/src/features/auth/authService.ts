import { z } from 'zod';
import { apiRequest, isUnauthorizedError } from '../../shared/api/apiClient';

const userSchema = z.object({ id: z.string(), email: z.string() });
const userResponseSchema = z.object({ user: userSchema }).transform((body) => body.user);

export type User = z.infer<typeof userSchema>;

export interface Credentials {
  email: string;
  password: string;
}

export const authService = {
  async getSession(signal?: AbortSignal): Promise<User | null> {
    try {
      return await apiRequest('/auth/me', { schema: userResponseSchema, signal });
    } catch (error) {
      if (isUnauthorizedError(error)) return null;
      throw error;
    }
  },

  login(credentials: Credentials): Promise<User> {
    return apiRequest('/auth/login', { method: 'POST', json: credentials, schema: userResponseSchema });
  },

  register(credentials: Credentials): Promise<User> {
    return apiRequest('/auth/register', { method: 'POST', json: credentials, schema: userResponseSchema });
  },

  logout(): Promise<undefined> {
    return apiRequest('/auth/logout', { method: 'POST', schema: z.undefined() });
  },
};
