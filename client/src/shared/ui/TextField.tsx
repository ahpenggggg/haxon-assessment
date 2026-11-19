import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
}

export function TextField({ label, className = '', ...inputProps }: TextFieldProps) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-text">
        {label}
      </label>
      <input
        id={id}
        className="min-h-11 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-primary focus:outline-2 focus:outline-primary disabled:opacity-60"
        {...inputProps}
      />
    </div>
  );
}
