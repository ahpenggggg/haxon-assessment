import { useEffect } from 'react';
import { useRouteError } from 'react-router';
import { Button } from './Button';

export function RouteErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-text-muted">An unexpected error occurred. Reload the page to try again.</p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </main>
  );
}
