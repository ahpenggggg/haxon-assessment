import type { ChangeEvent } from 'react';
import { TextField } from '../../shared/ui/TextField';

const PARTIAL_NUMBER = /^-?\d*\.?\d*$/;
const COMPLETE_NUMBER = '-?(\\d+(\\.\\d*)?|\\.\\d+)';
const COMPLETE_NUMBER_REGEX = new RegExp(`^${COMPLETE_NUMBER}$`);

interface CoordinateFieldProps {
  label: string;
  value: string;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: string) => void;
}

export function CoordinateField({ label, value, min, max, disabled, onChange }: CoordinateFieldProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    if (!PARTIAL_NUMBER.test(next)) return;

    const outOfRange = COMPLETE_NUMBER_REGEX.test(next) && (Number(next) < min || Number(next) > max);
    event.target.setCustomValidity(outOfRange ? `${label} must be between ${min} and ${max}.` : '');
    onChange(next);
  }

  return (
    <TextField
      label={label}
      type="text"
      autoComplete="off"
      required
      pattern={COMPLETE_NUMBER}
      title={`A number between ${min} and ${max}`}
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
