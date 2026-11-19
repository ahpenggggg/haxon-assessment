import { useState, type FormEvent } from 'react';
import { ErrorAlert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { TextField } from '../../shared/ui/TextField';
import { CoordinateField } from './CoordinateField';
import { useCreateLocation } from './locationsQueries';
import type { Location } from './locationsService';

interface AddLocationFormProps {
  onAdded: (location: Location) => void;
}

export function AddLocationForm({ onAdded }: AddLocationFormProps) {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const createLocation = useCreateLocation();
  const disabled = createLocation.isPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createLocation.mutate(
      { name, latitude: Number(latitude), longitude: Number(longitude) },
      {
        onSuccess: (location) => {
          setName('');
          setLatitude('');
          setLongitude('');
          onAdded(location);
        },
      },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Add a location">
      <TextField
        label="Location name"
        required
        maxLength={200}
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={disabled}
      />
      <div className="grid grid-cols-2 gap-3">
        <CoordinateField
          label="Latitude"
          min={-90}
          max={90}
          value={latitude}
          onChange={setLatitude}
          disabled={disabled}
        />
        <CoordinateField
          label="Longitude"
          min={-180}
          max={180}
          value={longitude}
          onChange={setLongitude}
          disabled={disabled}
        />
      </div>
      {createLocation.error && <ErrorAlert>{createLocation.error.message}</ErrorAlert>}
      <Button type="submit" disabled={disabled}>
        {disabled ? 'Adding…' : 'Add location'}
      </Button>
    </form>
  );
}
