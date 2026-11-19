export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-3 text-sm text-text-muted">
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
      />
      {label}
    </div>
  );
}

export function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}
