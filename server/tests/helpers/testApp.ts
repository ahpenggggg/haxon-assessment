import { PGlite } from '@electric-sql/pglite';
import AdmZip from 'adm-zip';
import { createApp } from '../../src/app.js';
import type { Db } from '../../src/db/db.js';
import { ensureSchema } from '../../src/db/schema.js';

export async function createTestApp() {
  const pglite = new PGlite();
  const db: Db = {
    async query<Row>(text: string, params?: unknown[]) {
      const result = await pglite.query<Row>(text, params);
      return { rows: result.rows };
    },
  };
  await ensureSchema(db);

  const app = createApp({
    db,
    token: { secret: 'test-secret-that-is-at-least-32-characters', expiresInSeconds: 3600 },
    cookieSecure: false,
  });
  return {
    app,
    reset: async () => {
      await pglite.query('TRUNCATE users CASCADE');
    },
    close: () => pglite.close(),
  };
}

export function buildZip(files: Record<string, string | Buffer>): Buffer {
  const zip = new AdmZip();
  for (const [name, content] of Object.entries(files)) {
    zip.addFile(name, typeof content === 'string' ? Buffer.from(content, 'utf8') : content);
  }
  return zip.toBuffer();
}

export const SAMPLE_FILE = [
  'Name, Latitude, Longitude',
  'Suria KLCC,3.157324409,101.7121981',
  'Zoo Negara,3.21054160,101.75920504',
].join('\n');
