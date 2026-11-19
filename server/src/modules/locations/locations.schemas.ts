import { z } from 'zod';

export const LOCATION_NAME_MAX_LENGTH = 200;

const LATITUDE_MESSAGE = 'Latitude must be a number between -90 and 90.';
const LONGITUDE_MESSAGE = 'Longitude must be a number between -180 and 180.';

export const locationInputSchema = z.object({
  name: z
    .string({ error: 'Location name is required.' })
    .trim()
    .min(1, 'Location name is required.')
    .max(LOCATION_NAME_MAX_LENGTH, `Location name must be at most ${LOCATION_NAME_MAX_LENGTH} characters.`),
  latitude: z.number({ error: LATITUDE_MESSAGE }).min(-90, LATITUDE_MESSAGE).max(90, LATITUDE_MESSAGE),
  longitude: z.number({ error: LONGITUDE_MESSAGE }).min(-180, LONGITUDE_MESSAGE).max(180, LONGITUDE_MESSAGE),
});

export type LocationInput = z.infer<typeof locationInputSchema>;
