import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-md">
        <p className="text-sm font-semibold text-primary">Location Manager</p>
        <h1 className="mt-1 mb-6 text-2xl font-bold">{title}</h1>
        {children}
        <div className="mt-6 text-center text-sm text-text-muted">{footer}</div>
      </div>
    </main>
  );
}
