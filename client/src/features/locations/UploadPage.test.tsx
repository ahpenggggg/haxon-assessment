import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ROUTES } from '../../app/routes';
import { mockApi, renderRoutes } from '../../test/renderRoutes';
import type { Location } from './locationsService';
import { UPLOAD_POPUP_DURATION_MS, UploadPage } from './UploadPage';

const EXISTING: Location = { id: '1', name: 'Existing', latitude: 1, longitude: 2 };
const IMPORTED: Location[] = [
  { id: '2', name: 'Suria KLCC', latitude: 3.157324409, longitude: 101.7121981 },
  { id: '3', name: 'Zoo Negara', latitude: 3.2105416, longitude: 101.75920504 },
];

function renderUploadPage() {
  const result = renderRoutes(
    [
      { path: ROUTES.upload, element: <UploadPage /> },
      { path: ROUTES.map, element: <h1>Map page</h1> },
    ],
    ROUTES.upload,
  );
  result.queryClient.setQueryData(['locations'], [EXISTING]);
  return result;
}

async function uploadZip() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
  const zip = new File(['zip-bytes'], 'locations.zip', { type: 'application/zip' });
  await user.upload(screen.getByLabelText('ZIP file'), zip);
  await user.click(screen.getByRole('button', { name: 'Upload' }));
}

describe('UploadPage', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a confirmation for three seconds, then adds the locations to the map', async () => {
    mockApi({ 'POST /api/locations/upload': { status: 201, body: { locations: IMPORTED } } });
    const { queryClient, router } = renderUploadPage();

    await uploadZip();

    expect(await screen.findByRole('status')).toHaveTextContent('2 locations imported');
    expect(queryClient.getQueryData(['locations'])).toEqual([EXISTING]);

    await act(() => vi.advanceTimersByTimeAsync(UPLOAD_POPUP_DURATION_MS));

    expect(queryClient.getQueryData(['locations'])).toEqual([EXISTING, ...IMPORTED]);
    expect(router.state.location.pathname).toBe(ROUTES.map);
    expect(await screen.findByRole('heading', { name: 'Map page' })).toBeInTheDocument();
  });

  it('shows the error for three seconds and adds nothing', async () => {
    const message = 'The ZIP file must contain exactly one .txt file and nothing else.';
    mockApi({ 'POST /api/locations/upload': { status: 400, body: { error: { message } } } });
    const { queryClient, router } = renderUploadPage();

    await uploadZip();

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    await act(() => vi.advanceTimersByTimeAsync(UPLOAD_POPUP_DURATION_MS));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(queryClient.getQueryData(['locations'])).toEqual([EXISTING]);
    expect(router.state.location.pathname).toBe(ROUTES.upload);
  });
});
