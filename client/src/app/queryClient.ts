import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { replaceSession, SESSION_QUERY_KEY } from '../features/auth/session';
import { ApiError, isUnauthorizedError } from '../shared/api/apiClient';

const MAX_RETRIES = 2;

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

export function createQueryClient(): QueryClient {
  const endExpiredSession = (error: unknown) => {
    if (isUnauthorizedError(error) && queryClient.getQueryData(SESSION_QUERY_KEY)) {
      replaceSession(queryClient, null);
    }
  };

  const queryClient = new QueryClient({
    queryCache: new QueryCache({ onError: endExpiredSession }),
    mutationCache: new MutationCache({ onError: endExpiredSession }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => !isClientError(error) && failureCount < MAX_RETRIES,
      },
    },
  });
  return queryClient;
}
