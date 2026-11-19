import { useId } from 'react';

interface ZipFilePickerProps {
  file: File | null;
  disabled: boolean;
  onChange: (file: File | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ArchiveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

export function ZipFilePicker({ file, disabled, onChange }: ZipFilePickerProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const stateClasses = file
    ? 'border-primary bg-primary-soft'
    : 'border-border bg-surface hover:border-primary hover:bg-canvas';

  return (
    <div className="flex flex-col gap-1">
      <span id={labelId} className="text-sm font-medium text-text">
        ZIP file
      </span>
      <label
        htmlFor={id}
        className={`flex min-h-20 items-center gap-4 rounded-lg border-2 border-dashed p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary ${stateClasses} ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <input
          id={id}
          type="file"
          className="sr-only"
          accept=".zip,application/zip,application/x-zip-compressed"
          aria-labelledby={labelId}
          aria-required="true"
          disabled={disabled}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        />
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-md ${file ? 'bg-primary text-white' : 'bg-canvas text-text-muted'}`}
        >
          <ArchiveIcon />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-text">{file ? file.name : 'Choose a ZIP file'}</span>
          <span className="text-xs text-text-muted">
            {file ? `${formatFileSize(file.size)} · ready to upload` : 'Click to browse. Only .zip files.'}
          </span>
        </span>
        <span className="shrink-0 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text">
          {file ? 'Change' : 'Browse'}
        </span>
      </label>
    </div>
  );
}
