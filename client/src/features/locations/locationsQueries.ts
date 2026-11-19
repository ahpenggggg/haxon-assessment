import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { locationsService, type Location, type NewLocation } from './locationsService';

const LOCATIONS_QUERY_KEY = ['locations'] as const;

export function useLocations() {
  return useQuery({
    queryKey: LOCATIONS_QUERY_KEY,
    queryFn: ({ signal }) => locationsService.list(signal),
  });
}

export function useAddLocationsToMap() {
  const queryClient = useQueryClient();
  return useCallback(
    (added: Location[]) => {
      queryClient.setQueryData<Location[]>(LOCATIONS_QUERY_KEY, (current) => {
        if (!current) return current;
        const knownIds = new Set(current.map((location) => location.id));
        return [...current, ...added.filter((location) => !knownIds.has(location.id))];
      });
    },
    [queryClient],
  );
}

export function useCreateLocation() {
  const addLocationsToMap = useAddLocationsToMap();
  return useMutation({
    mutationFn: (location: NewLocation) => locationsService.create(location),
    onSuccess: (location) => addLocationsToMap([location]),
  });
}

export function useUploadLocations() {
  return useMutation({
    mutationFn: (file: File) => locationsService.uploadZip(file),
  });
}
