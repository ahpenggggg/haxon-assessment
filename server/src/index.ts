import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { createPool, poolAsDb } from './db/db.js';
import { ensureSchema } from './db/schema.js';

const env = loadEnv();
const pool = createPool(env.DATABASE_URL);
const db = poolAsDb(pool);

await ensureSchema(db);

const app = createApp({
  db,
  token: { secret: env.JWT_SECRET, expiresInSeconds: env.JWT_EXPIRES_IN_SECONDS },
  cookieSecure: env.COOKIE_SECURE,
});

const server = app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
});

function shutdown(signal: string): void {
  console.log(`${signal} received, shutting down`);
  server.close(() => {
    pool.end().then(
      () => process.exit(0),
      (error: unknown) => {
        console.error('Failed to close the database pool', error);
        process.exit(1);
      },
    );
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
