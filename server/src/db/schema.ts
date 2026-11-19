import type { Db } from './db.js';

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS locations (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       text NOT NULL,
    latitude   double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude  double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS locations_user_id_created_at_idx ON locations (user_id, created_at)`,
];

export async function ensureSchema(db: Db): Promise<void> {
  for (const statement of SCHEMA_STATEMENTS) {
    await db.query(statement);
  }
}
