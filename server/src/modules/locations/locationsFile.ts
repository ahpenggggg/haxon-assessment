import { locationInputSchema, type LocationInput } from './locations.schemas.js';

export const MAX_LOCATIONS_PER_FILE = 5000;
const MAX_REPORTED_ERRORS = 5;

export type ParseResult = { ok: true; locations: LocationInput[] } | { ok: false; message: string };

const HEADER_PATTERN = /^name\s*,\s*latitude\s*,\s*longitude$/i;
const NUMBER_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

function toNumber(value: string): number {
  return NUMBER_PATTERN.test(value) ? Number(value) : Number.NaN;
}

export function parseLocationsText(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((content, index) => ({ lineNumber: index + 1, content: content.trim() }))
    .filter((line) => line.content !== '');

  if (lines[0] && HEADER_PATTERN.test(lines[0].content)) {
    lines.shift();
  }
  if (lines.length === 0) {
    return { ok: false, message: 'The text file does not contain any locations.' };
  }
  if (lines.length > MAX_LOCATIONS_PER_FILE) {
    return { ok: false, message: `The text file can contain at most ${MAX_LOCATIONS_PER_FILE} locations.` };
  }

  const locations: LocationInput[] = [];
  const errors: string[] = [];

  for (const { lineNumber, content } of lines) {
    const lastComma = content.lastIndexOf(',');
    const secondLastComma = lastComma > 0 ? content.lastIndexOf(',', lastComma - 1) : -1;
    if (secondLastComma < 0) {
      errors.push(`Line ${lineNumber}: expected "Name, Latitude, Longitude".`);
      continue;
    }

    const result = locationInputSchema.safeParse({
      name: content.slice(0, secondLastComma),
      latitude: toNumber(content.slice(secondLastComma + 1, lastComma).trim()),
      longitude: toNumber(content.slice(lastComma + 1).trim()),
    });
    if (result.success) {
      locations.push(result.data);
    } else {
      errors.push(`Line ${lineNumber}: ${result.error.issues[0]?.message ?? 'invalid location.'}`);
    }
  }

  if (errors.length > 0) {
    const shown = errors.slice(0, MAX_REPORTED_ERRORS);
    const remaining = errors.length - shown.length;
    const suffix = remaining > 0 ? ` (and ${remaining} more)` : '';
    return { ok: false, message: `The file has invalid lines. ${shown.join(' ')}${suffix}` };
  }
  return { ok: true, locations };
}
