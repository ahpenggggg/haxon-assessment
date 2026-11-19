import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { mockApi, renderRoutes } from '../../test/renderRoutes';
import { AddLocationForm } from './AddLocationForm';

function renderForm() {
  renderRoutes([{ path: '/', element: <AddLocationForm onAdded={vi.fn()} /> }], '/');
}

describe('AddLocationForm coordinates', () => {
  it('are plain text inputs without up/down arrows', () => {
    renderForm();

    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Longitude')).toHaveAttribute('type', 'text');
  });

  it('accept only numbers', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Latitude'), 'a-3.1e5x7');
    await user.type(screen.getByLabelText('Longitude'), '1-0+1.5.2');

    expect(screen.getByLabelText('Latitude')).toHaveValue('-3.157');
    expect(screen.getByLabelText('Longitude')).toHaveValue('101.52');
  });

  it('block out-of-range values before submitting', async () => {
    const fetchMock = mockApi({});
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Location name'), 'Somewhere');
    await user.type(screen.getByLabelText('Latitude'), '95');
    await user.type(screen.getByLabelText('Longitude'), '101');
    await user.click(screen.getByRole('button', { name: 'Add location' }));

    expect(screen.getByLabelText('Latitude')).toBeInvalid();
    expect(screen.getByLabelText('Longitude')).toBeValid();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submit the values as numbers', async () => {
    const fetchMock = mockApi({
      'POST /api/locations': {
        status: 201,
        body: { location: { id: '1', name: 'Suria KLCC', latitude: -3.15, longitude: 101.71 } },
      },
    });
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Location name'), 'Suria KLCC');
    await user.type(screen.getByLabelText('Latitude'), '-3.15');
    await user.type(screen.getByLabelText('Longitude'), '101.71');
    await user.click(screen.getByRole('button', { name: 'Add location' }));

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, init] = fetchMock.mock.calls[0] ?? [];
    expect(JSON.parse(String(init?.body))).toEqual({ name: 'Suria KLCC', latitude: -3.15, longitude: 101.71 });
  });
});
