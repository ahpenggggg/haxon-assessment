import pg from 'pg';

export interface Db {
  query<Row>(text: string, params?: unknown[]): Promise<{ rows: Row[] }>;
}

export function createPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString });
}

export function poolAsDb(pool: pg.Pool): Db {
  return {
    async query<Row>(text: string, params?: unknown[]) {
      const result = await pool.query(text, params);
      return { rows: result.rows as Row[] };
    },
  };
}

export const UNIQUE_VIOLATION = '23505';

export function isPgErrorWithCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
