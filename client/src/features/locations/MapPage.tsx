import { useState } from 'react';
import { ErrorAlert } from '../../shared/ui/Alert';
import { Button } from '../../shared/ui/Button';
import { Spinner } from '../../shared/ui/Spinner';
import { AddLocationForm } from './AddLocationForm';
import { LocationMap } from './LocationMap';
import { useLocations } from './locationsQueries';
import type { Location } from './locationsService';

export function MapPage() {
  const locations = useLocations();
  const [lastAdded, setLastAdded] = useState<Location | null>(null);

  return (
    <div className="flex flex-col gap-4 lg:h-full lg:flex-row">
      <section className="shrink-0 rounded-lg bg-surface p-5 shadow-sm lg:w-80">
        <h1 className="text-xl font-bold">Map</h1>
        <p className="mt-1 mb-5 text-sm text-text-muted">Add a location to place a marker on the map.</p>
        <AddLocationForm onAdded={setLastAdded} />
        {locations.isSuccess && (
          <p className="mt-5 text-sm text-text-muted">
            {locations.data.length === 0
              ? 'You have no locations yet.'
              : `${locations.data.length} ${locations.data.length === 1 ? 'location' : 'locations'} on your map.`}
          </p>
        )}
      </section>

      <section
        aria-label="Map of your locations"
        className="flex min-h-[60vh] flex-1 items-center justify-center overflow-hidden rounded-lg bg-surface shadow-sm"
      >
        {locations.isPending && <Spinner label="Loading your locations…" />}
        {locations.isError && (
          <div className="flex flex-col items-center gap-3 p-4">
            <ErrorAlert>{locations.error.message}</ErrorAlert>
            <Button variant="secondary" onClick={() => locations.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {locations.isSuccess && <LocationMap locations={locations.data} focusedLocation={lastAdded} />}
      </section>
    </div>
  );
}
