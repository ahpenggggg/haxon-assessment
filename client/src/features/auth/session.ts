import type { QueryClient } from '@tanstack/react-query';
import type { User } from './authService';

export const SESSION_QUERY_KEY = ['session'] as const;

export function replaceSession(queryClient: QueryClient, user: User | null): void {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== SESSION_QUERY_KEY[0] });
  queryClient.setQueryData(SESSION_QUERY_KEY, user);
}
