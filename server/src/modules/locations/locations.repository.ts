import type { Db } from '../../db/db.js';
import type { LocationInput } from './locations.schemas.js';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

type LocationRow = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: Date;
};

const RETURNED_COLUMNS = 'id, name, latitude, longitude, created_at';

function toLocation(row: LocationRow): Location {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at.toISOString(),
  };
}

export function createLocationsRepository(db: Db) {
  return {
    async listByUser(userId: string): Promise<Location[]> {
      const { rows } = await db.query<LocationRow>(
        `SELECT ${RETURNED_COLUMNS} FROM locations WHERE user_id = $1 ORDER BY created_at`,
        [userId],
      );
      return rows.map(toLocation);
    },

    async createMany(userId: string, inputs: LocationInput[]): Promise<Location[]> {
      const { rows } = await db.query<LocationRow>(
        `INSERT INTO locations (user_id, name, latitude, longitude)
         SELECT $1, name, latitude, longitude
         FROM unnest($2::text[], $3::double precision[], $4::double precision[]) AS input (name, latitude, longitude)
         RETURNING ${RETURNED_COLUMNS}`,
        [
          userId,
          inputs.map((input) => input.name),
          inputs.map((input) => input.latitude),
          inputs.map((input) => input.longitude),
        ],
      );
      return rows.map(toLocation);
    },
  };
}

export type LocationsRepository = ReturnType<typeof createLocationsRepository>;
