import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../app/routes';
import { Button } from '../../shared/ui/Button';
import { TimedPopup } from '../../shared/ui/TimedPopup';
import { useAddLocationsToMap, useUploadLocations } from './locationsQueries';
import type { Location } from './locationsService';
import { ZipFilePicker } from './ZipFilePicker';

export const UPLOAD_POPUP_DURATION_MS = 3000;

type UploadOutcome = { kind: 'success'; locations: Location[] } | { kind: 'error'; message: string };

const SAMPLE_FILE = `Name, Latitude, Longitude
Suria KLCC,3.157324409,101.7121981
Zoo Negara,3.21054160,101.75920504`;

function pluralLocations(count: number): string {
  return `${count} ${count === 1 ? 'location' : 'locations'}`;
}

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outcome, setOutcome] = useState<UploadOutcome | null>(null);
  const upload = useUploadLocations();
  const addLocationsToMap = useAddLocationsToMap();
  const navigate = useNavigate();
  const busy = upload.isPending || outcome !== null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    const form = event.currentTarget;
    upload.mutate(file, {
      onSuccess: (locations) => setOutcome({ kind: 'success', locations }),
      onError: (error) => setOutcome({ kind: 'error', message: error.message }),
      onSettled: () => {
        form.reset();
        setFile(null);
      },
    });
  }

  function handlePopupClose() {
    if (outcome?.kind === 'success') {
      addLocationsToMap(outcome.locations);
      navigate(ROUTES.map);
    }
    setOutcome(null);
  }

  return (
    <div className="max-w-2xl">
      <section className="rounded-lg bg-surface p-5 shadow-sm">
        <h1 className="text-xl font-bold">Upload locations</h1>
        <p className="mt-1 mb-5 text-sm text-text-muted">
          Upload a ZIP file that contains exactly one <code>.txt</code> file of locations.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Upload locations">
          <ZipFilePicker file={file} disabled={busy} onChange={setFile} />
          <Button type="submit" disabled={busy || !file} className="self-start">
            {upload.isPending ? 'Uploading…' : 'Upload'}
          </Button>
        </form>
      </section>

      <section className="mt-4 rounded-lg bg-surface p-5 shadow-sm">
        <h2 className="text-base font-semibold">Text file format</h2>
        <p className="mt-1 text-sm text-text-muted">
          One location per line as <code>Name, Latitude, Longitude</code>. The header line is optional.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-canvas p-3 text-sm">{SAMPLE_FILE}</pre>
      </section>

      {outcome && (
        <TimedPopup
          variant={outcome.kind}
          title={outcome.kind === 'success' ? 'Upload successful' : 'Upload failed'}
          message={
            outcome.kind === 'success'
              ? `${pluralLocations(outcome.locations.length)} imported. Adding them to your map…`
              : outcome.message
          }
          durationMs={UPLOAD_POPUP_DURATION_MS}
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}
