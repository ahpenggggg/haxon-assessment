import { describe, expect, it } from 'vitest';
import { MAX_LOCATIONS_PER_FILE, parseLocationsText } from '../src/modules/locations/locationsFile.js';
import { SAMPLE_FILE } from './helpers/testApp.js';

describe('parseLocationsText', () => {
  it('parses the sample format from the requirement, skipping the header', () => {
    expect(parseLocationsText(SAMPLE_FILE)).toEqual({
      ok: true,
      locations: [
        { name: 'Suria KLCC', latitude: 3.157324409, longitude: 101.7121981 },
        { name: 'Zoo Negara', latitude: 3.2105416, longitude: 101.75920504 },
      ],
    });
  });

  it('accepts files without a header, with CRLF line endings, a BOM and blank lines', () => {
    const result = parseLocationsText('\uFEFFA,1,2\r\n\r\n  B , -3.5 , 4  \r\n');
    expect(result).toEqual({
      ok: true,
      locations: [
        { name: 'A', latitude: 1, longitude: 2 },
        { name: 'B', latitude: -3.5, longitude: 4 },
      ],
    });
  });

  it('keeps commas inside the name', () => {
    expect(parseLocationsText('Kuala Lumpur, KL,3.1,101.7')).toEqual({
      ok: true,
      locations: [{ name: 'Kuala Lumpur, KL', latitude: 3.1, longitude: 101.7 }],
    });
  });

  it.each([
    ['missing fields', 'Only a name'],
    ['non-numeric latitude', 'A,abc,2'],
    ['empty longitude', 'A,1,'],
    ['latitude out of range', 'A,91,2'],
    ['longitude out of range', 'A,1,181'],
    ['empty name', ',1,2'],
    ['hex number', 'A,0x1,2'],
  ])('rejects the whole file on %s', (_case, line) => {
    const result = parseLocationsText(`Good,1,2\n${line}`);
    expect(result.ok).toBe(false);
    expect(result.ok === false && result.message).toContain('Line 2');
  });

  it('rejects a file with only a header', () => {
    expect(parseLocationsText('Name, Latitude, Longitude\n')).toEqual({
      ok: false,
      message: 'The text file does not contain any locations.',
    });
  });

  it('rejects files over the row limit', () => {
    const text = Array.from({ length: MAX_LOCATIONS_PER_FILE + 1 }, (_, i) => `P${i},1,2`).join('\n');
    expect(parseLocationsText(text).ok).toBe(false);
  });
});
