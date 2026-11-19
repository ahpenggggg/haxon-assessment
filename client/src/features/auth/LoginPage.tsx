import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { useLogin } from './authQueries';
import { AuthCard } from './AuthCard';
import { CredentialsForm } from './CredentialsForm';

export function LoginPage() {
  const login = useLogin();

  return (
    <AuthCard
      title="Log in"
      footer={
        <>
          No account yet?{' '}
          <Link to={ROUTES.register} className="font-semibold text-primary hover:underline">
            Register
          </Link>
        </>
      }
    >
      <CredentialsForm
        submitLabel="Log in"
        pendingLabel="Logging in…"
        passwordAutoComplete="current-password"
        isPending={login.isPending}
        errorMessage={login.error?.message ?? null}
        onSubmit={(credentials) => login.mutate(credentials)}
      />
    </AuthCard>
  );
}
