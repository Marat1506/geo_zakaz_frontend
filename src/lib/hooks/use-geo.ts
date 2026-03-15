'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { geoApi } from '@/lib/api/endpoints/geo';
import { useGeoStore } from '@/lib/store/geo-store';
import { Location, ServiceZone } from '@/types/geo';

export function useCheckLocation() {
  const { setLocation } = useGeoStore();

  return useMutation({
    mutationFn: (location: Location) => geoApi.checkLocation(location),
    onSuccess: (data, variables) => {
      setLocation(variables, data.inServiceZone, data.zoneName);
    },
  });
}

export function useServiceZones() {
  return useQuery({
    queryKey: ['serviceZones'],
    queryFn: () => geoApi.getServiceZones(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePublicServiceZones() {
  return useQuery({
    queryKey: ['publicServiceZones'],
    queryFn: () => geoApi.getPublicServiceZones(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateServiceZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zone: Omit<ServiceZone, 'id'>) =>
      geoApi.createServiceZone(zone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceZones'] });
    },
  });
}

export function useUpdateServiceZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, zone }: { id: string; zone: Partial<ServiceZone> }) =>
      geoApi.updateServiceZone(id, zone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceZones'] });
    },
  });
}

export function useDeleteServiceZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => geoApi.deleteServiceZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceZones'] });
    },
  });
}
