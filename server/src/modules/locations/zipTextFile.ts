import AdmZip from 'adm-zip';

export const MAX_TEXT_FILE_BYTES = 5 * 1024 * 1024;

export type ExtractResult = { ok: true; text: string } | { ok: false; message: string };

export const SINGLE_TEXT_FILE_MESSAGE = 'The ZIP file must contain exactly one .txt file and nothing else.';

export function extractSingleTextFile(zipBuffer: Buffer): ExtractResult {
  let files: AdmZip.IZipEntry[];
  try {
    files = new AdmZip(zipBuffer).getEntries().filter((entry) => !entry.isDirectory);
  } catch {
    return { ok: false, message: 'The upload is not a valid ZIP file.' };
  }

  const [file, ...others] = files;
  if (!file || others.length > 0 || !file.entryName.toLowerCase().endsWith('.txt')) {
    return { ok: false, message: SINGLE_TEXT_FILE_MESSAGE };
  }
  if (file.header.size > MAX_TEXT_FILE_BYTES) {
    return { ok: false, message: 'The text file inside the ZIP is too large.' };
  }

  let data: Buffer;
  try {
    data = file.getData();
  } catch {
    return { ok: false, message: 'The text file inside the ZIP could not be read.' };
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(data);
    if (text.includes('\u0000')) {
      return { ok: false, message: SINGLE_TEXT_FILE_MESSAGE };
    }
    return { ok: true, text };
  } catch {
    return { ok: false, message: 'The text file must be UTF-8 encoded text.' };
  }
}
