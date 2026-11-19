import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { vi } from 'vitest';
import { createQueryClient } from '../app/queryClient';

export function renderRoutes(routes: RouteObject[], initialPath: string) {
  const queryClient = createQueryClient();
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { queryClient, router };
}

type MockRoute = { status: number; body?: unknown };

export function mockApi(routes: Record<string, MockRoute>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const key = `${init?.method ?? 'GET'} ${String(input)}`;
    const route = routes[key];
    if (!route) throw new Error(`Unexpected request: ${key}`);
    return new Response(route.body === undefined ? null : JSON.stringify(route.body), { status: route.status });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
