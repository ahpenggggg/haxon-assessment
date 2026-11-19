import { latLngBounds, type LatLngTuple } from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Location } from './locationsService';
import { markerIcon } from './markerIcon';

const DEFAULT_CENTER: LatLngTuple = [3.139, 101.6869];
const DEFAULT_ZOOM = 11;
const FOCUS_MIN_ZOOM = 13;

function toLatLng(location: Location): LatLngTuple {
  return [location.latitude, location.longitude];
}

function FlyToLocation({ location }: { location: Location }) {
  const map = useMap();
  const { latitude, longitude } = location;

  useEffect(() => {
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), FOCUS_MIN_ZOOM));
  }, [map, latitude, longitude]);

  return null;
}

interface LocationMapProps {
  locations: Location[];
  focusedLocation: Location | null;
}

export function LocationMap({ locations, focusedLocation }: LocationMapProps) {
  const [initialBounds] = useState(() =>
    locations.length > 0 ? latLngBounds(locations.map(toLatLng)) : undefined,
  );

  return (
    <MapContainer
      className="h-full min-h-96 w-full"
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      bounds={initialBounds}
      boundsOptions={{ padding: [40, 40], maxZoom: FOCUS_MIN_ZOOM }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker key={location.id} position={toLatLng(location)} icon={markerIcon} alt={location.name}>
          <Popup>{location.name}</Popup>
        </Marker>
      ))}
      {focusedLocation && <FlyToLocation location={focusedLocation} />}
    </MapContainer>
  );
}
