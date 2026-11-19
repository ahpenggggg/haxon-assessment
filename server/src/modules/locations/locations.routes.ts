import { Router } from 'express';
import multer from 'multer';
import { HttpError } from '../../http/httpError.js';
import { getAuthUserId } from '../auth/requireAuth.js';
import { locationInputSchema } from './locations.schemas.js';
import type { LocationsService } from './locations.service.js';

export const MAX_ZIP_UPLOAD_BYTES = 1024 * 1024;
export const UPLOAD_FIELD_NAME = 'file';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ZIP_UPLOAD_BYTES, files: 1 },
});

export function createLocationsRouter(locationsService: LocationsService): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const locations = await locationsService.list(getAuthUserId(req));
    res.json({ locations });
  });

  router.post('/', async (req, res) => {
    const input = locationInputSchema.parse(req.body ?? {});
    const location = await locationsService.create(getAuthUserId(req), input);
    res.status(201).json({ location });
  });

  router.post('/upload', upload.single(UPLOAD_FIELD_NAME), async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, 'Choose a ZIP file to upload.');
    }
    const locations = await locationsService.importFromZip(getAuthUserId(req), req.file.buffer);
    res.status(201).json({ locations });
  });

  return router;
}
