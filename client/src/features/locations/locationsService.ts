import { z } from 'zod';
import { apiRequest } from '../../shared/api/apiClient';

const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type Location = z.infer<typeof locationSchema>;
export type NewLocation = Omit<Location, 'id'>;

const locationListSchema = z.object({ locations: z.array(locationSchema) }).transform((body) => body.locations);
const locationResponseSchema = z.object({ location: locationSchema }).transform((body) => body.location);

const UPLOAD_FIELD_NAME = 'file';

export const locationsService = {
  list(signal?: AbortSignal): Promise<Location[]> {
    return apiRequest('/locations', { schema: locationListSchema, signal });
  },

  create(location: NewLocation): Promise<Location> {
    return apiRequest('/locations', { method: 'POST', json: location, schema: locationResponseSchema });
  },

  uploadZip(file: File): Promise<Location[]> {
    const formData = new FormData();
    formData.append(UPLOAD_FIELD_NAME, file);
    return apiRequest('/locations/upload', { method: 'POST', formData, schema: locationListSchema });
  },
};
