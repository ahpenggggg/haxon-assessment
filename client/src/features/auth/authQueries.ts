import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService, type Credentials } from './authService';
import { replaceSession, SESSION_QUERY_KEY } from './session';

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: ({ signal }) => authService.getSession(signal),
    staleTime: Infinity,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: Credentials) => authService.login(credentials),
    onSuccess: (user) => replaceSession(queryClient, user),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials: Credentials) => authService.register(credentials),
    onSuccess: (user) => replaceSession(queryClient, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => replaceSession(queryClient, null),
  });
}
