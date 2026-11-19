import { z } from 'zod';

const email = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: 'Enter a valid email address.' }).max(254, 'Email is too long.'));

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 72;

export const registerSchema = z.object({
  email,
  password: z
    .string({ error: 'Password is required.' })
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH, `Password must be at most ${PASSWORD_MAX_LENGTH} characters.`),
});

export const loginSchema = z.object({
  email,
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.'),
});

export type Credentials = z.infer<typeof loginSchema>;
