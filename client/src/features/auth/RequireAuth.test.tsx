import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../../app/routes';
import { mockApi, renderRoutes } from '../../test/renderRoutes';
import { RequireAuth } from './RequireAuth';

const routes = [
  { path: ROUTES.login, element: <h1>Login page</h1> },
  { element: <RequireAuth />, children: [{ path: ROUTES.map, element: <h1>Map page</h1> }] },
];

describe('RequireAuth', () => {
  it('redirects an unauthenticated visitor to the login page', async () => {
    mockApi({ 'GET /api/auth/me': { status: 401, body: { error: { message: 'Please log in to continue.' } } } });
    const { router } = renderRoutes(routes, ROUTES.map);

    expect(await screen.findByRole('heading', { name: 'Login page' })).toBeInTheDocument();
    expect(router.state.location.state).toEqual({ from: ROUTES.map });
  });

  it('shows the protected page to a signed-in user', async () => {
    mockApi({ 'GET /api/auth/me': { status: 200, body: { user: { id: 'u1', email: 'a@example.com' } } } });
    renderRoutes(routes, ROUTES.map);

    expect(await screen.findByRole('heading', { name: 'Map page' })).toBeInTheDocument();
  });
});
