import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES } from '../../app/routes';
import { FullPageSpinner } from '../../shared/ui/Spinner';
import { useSession } from './authQueries';

const RETURNABLE_ROUTES: readonly string[] = [ROUTES.map, ROUTES.upload];

function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state && typeof state.from === 'string') {
    return RETURNABLE_ROUTES.includes(state.from) ? state.from : ROUTES.map;
  }
  return ROUTES.map;
}

export function RedirectIfAuthenticated() {
  const session = useSession();
  const location = useLocation();

  if (session.isPending) {
    return <FullPageSpinner label="Checking your session…" />;
  }
  if (session.data) {
    return <Navigate to={redirectTarget(location.state)} replace />;
  }
  return <Outlet />;
}
