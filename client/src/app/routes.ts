export const ROUTES = {
  login: '/login',
  register: '/register',
  map: '/map',
  upload: '/upload',
} as const;

export interface LoginRedirectState {
  from: string;
}
