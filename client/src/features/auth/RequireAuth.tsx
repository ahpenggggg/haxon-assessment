import { Navigate, Outlet, useLocation } from 'react-router';
import { ROUTES, type LoginRedirectState } from '../../app/routes';
import { ErrorAlert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { FullPageSpinner } from '../../shared/ui/Spinner';
import { useSession } from './authQueries';

export function RequireAuth() {
  const session = useSession();
  const location = useLocation();

  if (session.isPending) {
    return <FullPageSpinner label="Checking your session…" />;
  }
  if (session.isError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <ErrorAlert>{session.error.message}</ErrorAlert>
        <Button onClick={() => session.refetch()}>Try again</Button>
      </main>
    );
  }
  if (!session.data) {
    const state: LoginRedirectState = { from: location.pathname };
    return <Navigate to={ROUTES.login} replace state={state} />;
  }
  return <Outlet />;
}
