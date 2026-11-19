import { z } from 'zod';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const errorBodySchema = z.object({ error: z.object({ message: z.string() }) });

const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Check your connection and try again.';
const SERVER_ERROR_MESSAGE = 'Something went wrong on our side. Please try again.';
const UNEXPECTED_RESPONSE_MESSAGE = 'The server sent an unexpected response. Please try again.';

interface RequestOptions<T> {
  schema: z.ZodType<T>;
  method?: 'GET' | 'POST';
  json?: unknown;
  formData?: FormData;
  signal?: AbortSignal;
}

function toRequestBody({ json, formData }: Pick<RequestOptions<unknown>, 'json' | 'formData'>) {
  if (formData) return { body: formData };
  if (json !== undefined) return { body: JSON.stringify(json), headers: { 'Content-Type': 'application/json' } };
  return {};
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === '') return undefined;
  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(response.status, UNEXPECTED_RESPONSE_MESSAGE);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions<T>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? 'GET',
      credentials: 'same-origin',
      signal: options.signal,
      ...toRequestBody(options),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const body = await readJson(response);

  if (!response.ok) {
    const parsedError = errorBodySchema.safeParse(body);
    const message =
      response.status < 500 && parsedError.success ? parsedError.data.error.message : SERVER_ERROR_MESSAGE;
    throw new ApiError(response.status, message);
  }

  const parsed = options.schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(response.status, UNEXPECTED_RESPONSE_MESSAGE);
  }
  return parsed.data;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
