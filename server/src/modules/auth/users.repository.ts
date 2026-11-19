import { isPgErrorWithCode, UNIQUE_VIOLATION, type Db } from '../../db/db.js';

export interface User {
  id: string;
  email: string;
}

interface UserWithPasswordHash extends User {
  passwordHash: string;
}

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
};

export function createUsersRepository(db: Db) {
  return {
    async findByEmail(email: string): Promise<UserWithPasswordHash | null> {
      const { rows } = await db.query<UserRow>(
        'SELECT id, email, password_hash FROM users WHERE email = $1',
        [email],
      );
      const row = rows[0];
      return row ? { id: row.id, email: row.email, passwordHash: row.password_hash } : null;
    },

    async findById(id: string): Promise<User | null> {
      const { rows } = await db.query<User>('SELECT id, email FROM users WHERE id = $1', [id]);
      return rows[0] ?? null;
    },

    async create(email: string, passwordHash: string): Promise<User | null> {
      try {
        const { rows } = await db.query<User>(
          'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
          [email, passwordHash],
        );
        return rows[0] ?? null;
      } catch (error) {
        if (isPgErrorWithCode(error, UNIQUE_VIOLATION)) {
          return null;
        }
        throw error;
      }
    },
  };
}

export type UsersRepository = ReturnType<typeof createUsersRepository>;
