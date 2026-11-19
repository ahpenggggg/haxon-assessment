import { useState, type FormEvent } from 'react';
import { ErrorAlert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import type { Credentials } from './authService';

interface CredentialsFormProps {
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage: string | null;
  passwordAutoComplete: 'new-password' | 'current-password';
  onSubmit: (credentials: Credentials) => void;
}

export function CredentialsForm({
  submitLabel,
  pendingLabel,
  isPending,
  errorMessage,
  passwordAutoComplete,
  onSubmit,
}: CredentialsFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isNewPassword = passwordAutoComplete === 'new-password';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ email, password });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={isPending}
      />
      <TextField
        label={isNewPassword ? 'Password (at least 8 characters)' : 'Password'}
        type="password"
        autoComplete={passwordAutoComplete}
        required
        minLength={isNewPassword ? 8 : undefined}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        disabled={isPending}
      />
      {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
      <Button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
