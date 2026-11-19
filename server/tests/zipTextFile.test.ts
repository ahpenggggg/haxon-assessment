import { describe, expect, it } from 'vitest';
import { extractSingleTextFile, SINGLE_TEXT_FILE_MESSAGE } from '../src/modules/locations/zipTextFile.js';
import { buildZip, SAMPLE_FILE } from './helpers/testApp.js';

describe('extractSingleTextFile', () => {
  it('returns the text of the only .txt file', () => {
    expect(extractSingleTextFile(buildZip({ 'locations.txt': SAMPLE_FILE }))).toEqual({
      ok: true,
      text: SAMPLE_FILE,
    });
  });

  it('accepts a .txt file inside a folder', () => {
    const zip = buildZip({ 'data/': Buffer.alloc(0), 'data/LOCATIONS.TXT': 'A,1,2' });
    expect(extractSingleTextFile(zip)).toEqual({ ok: true, text: 'A,1,2' });
  });

  it.each([
    ['an empty archive', {}],
    ['two text files', { 'a.txt': 'A,1,2', 'b.txt': 'B,1,2' }],
    ['a non-.txt file', { 'locations.csv': 'A,1,2' }],
    ['a text file plus another file', { 'a.txt': 'A,1,2', 'readme.md': '#' }],
    ['a text file plus macOS metadata', { 'a.txt': 'A,1,2', '__MACOSX/._a.txt': 'x' }],
    ['binary content in a .txt file', { 'a.txt': Buffer.from([0x41, 0x00, 0x42]) }],
  ])('rejects %s', (_case, files: Record<string, string | Buffer>) => {
    expect(extractSingleTextFile(buildZip(files))).toEqual({ ok: false, message: SINGLE_TEXT_FILE_MESSAGE });
  });

  it('rejects data that is not a ZIP', () => {
    expect(extractSingleTextFile(Buffer.from('not a zip'))).toEqual({
      ok: false,
      message: 'The upload is not a valid ZIP file.',
    });
  });

  it('rejects text that is not valid UTF-8', () => {
    const result = extractSingleTextFile(buildZip({ 'a.txt': Buffer.from([0xff, 0xfe, 0xfd]) }));
    expect(result.ok).toBe(false);
  });
});
