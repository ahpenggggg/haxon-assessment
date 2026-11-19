import type { ErrorRequestHandler, RequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { HttpError } from './httpError.js';

export interface ErrorResponseBody {
  error: { message: string };
}

function send(res: Parameters<RequestHandler>[1], status: number, message: string): void {
  const body: ErrorResponseBody = { error: { message } };
  res.status(status).json(body);
}

const MULTER_MESSAGES: Partial<Record<MulterError['code'], string>> = {
  LIMIT_FILE_SIZE: 'The ZIP file is too large.',
  LIMIT_FILE_COUNT: 'Upload a single ZIP file.',
  LIMIT_UNEXPECTED_FILE: 'Upload a single ZIP file in the "file" field.',
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  send(res, 404, 'Not found.');
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  if (error instanceof HttpError) {
    send(res, error.status, error.message);
    return;
  }
  if (error instanceof ZodError) {
    send(res, 400, error.issues[0]?.message ?? 'Invalid request.');
    return;
  }
  if (error instanceof MulterError) {
    send(res, error.code === 'LIMIT_FILE_SIZE' ? 413 : 400, MULTER_MESSAGES[error.code] ?? 'Invalid upload.');
    return;
  }
  if (error instanceof Error && 'status' in error && typeof error.status === 'number' && error.status < 500) {
    send(res, error.status, error.status === 413 ? 'Request body is too large.' : 'Malformed request body.');
    return;
  }

  console.error('Unhandled error', error);
  send(res, 500, 'Something went wrong. Please try again.');
};
