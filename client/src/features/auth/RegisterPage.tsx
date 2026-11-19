import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { useRegister } from './authQueries';
import { AuthCard } from './AuthCard';
import { CredentialsForm } from './CredentialsForm';

export function RegisterPage() {
  const register = useRegister();

  return (
    <AuthCard
      title="Create an account"
      footer={
        <>
          Already registered?{' '}
          <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <CredentialsForm
        submitLabel="Register"
        pendingLabel="Creating account…"
        passwordAutoComplete="new-password"
        isPending={register.isPending}
        errorMessage={register.error?.message ?? null}
        onSubmit={(credentials) => register.mutate(credentials)}
      />
    </AuthCard>
  );
}
