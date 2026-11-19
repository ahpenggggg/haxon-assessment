import { HttpError } from '../../http/httpError.js';
import { parseLocationsText } from './locationsFile.js';
import type { Location, LocationsRepository } from './locations.repository.js';
import type { LocationInput } from './locations.schemas.js';
import { extractSingleTextFile } from './zipTextFile.js';

export function createLocationsService(locations: LocationsRepository) {
  return {
    list(userId: string): Promise<Location[]> {
      return locations.listByUser(userId);
    },

    async create(userId: string, input: LocationInput): Promise<Location> {
      const [created] = await locations.createMany(userId, [input]);
      if (!created) {
        throw new Error('Location insert returned no row.');
      }
      return created;
    },

    async importFromZip(userId: string, zipBuffer: Buffer): Promise<Location[]> {
      const extracted = extractSingleTextFile(zipBuffer);
      if (!extracted.ok) {
        throw new HttpError(400, extracted.message);
      }
      const parsed = parseLocationsText(extracted.text);
      if (!parsed.ok) {
        throw new HttpError(400, parsed.message);
      }
      return locations.createMany(userId, parsed.locations);
    },
  };
}

export type LocationsService = ReturnType<typeof createLocationsService>;
