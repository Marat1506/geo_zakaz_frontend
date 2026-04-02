'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { OrderStatus } from '@/types/order';

// ── Seller zones ─────────────────────────────────────────────────────────────

export function useSellerZones() {
  return useQuery({
    queryKey: ['sellerZones'],
    queryFn: async () => {
      const { data } = await apiClient.get('/geo/zones');
      return data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicZones() {
  return useQuery({
    queryKey: ['publicZones'],
    queryFn: async () => {
      const { data } = await apiClient.get('/geo/zones/public');
      return data as any[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateSellerZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (zone: any) => {
      let payload: any;
      if (zone.type === 'circle') {
        const center = zone.center;
        payload = {
          name: zone.name,
          type: 'circle',
          centerLat: center.latitude,
          centerLng: center.longitude,
          radiusMeters: zone.radius,
          active: zone.active ?? true,
        };
      } else {
        payload = { name: zone.name, type: 'polygon', polygonCoordinates: zone.coordinates, active: zone.active ?? true };
      }
      const { data } = await apiClient.post('/geo/zones', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerZones'] });
      queryClient.invalidateQueries({ queryKey: ['publicZones'] });
    },
  });
}

export function useUpdateSellerZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, zone }: { id: string; zone: any }) => {
      let payload: any;
      if (zone.type === 'circle') {
        const center = zone.center;
        payload = {
          name: zone.name,
          type: 'circle',
          centerLat: center.latitude,
          centerLng: center.longitude,
          radiusMeters: zone.radius,
          active: zone.active ?? true,
        };
      } else {
        payload = { name: zone.name, type: 'polygon', polygonCoordinates: zone.coordinates, active: zone.active ?? true };
      }
      const { data } = await apiClient.patch(`/geo/zones/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerZones'] });
      queryClient.invalidateQueries({ queryKey: ['publicZones'] });
    },
  });
}

export function useDeleteSellerZone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/geo/zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerZones'] });
      queryClient.invalidateQueries({ queryKey: ['publicZones'] });
    },
  });
}

// ── Seller menu ───────────────────────────────────────────────────────────────

export function useSellerMenu(zoneId?: string) {
  return useQuery({
    queryKey: ['sellerMenu', zoneId],
    queryFn: async () => {
      const url = zoneId ? `/menu/admin?zoneId=${zoneId}` : '/menu/admin';
      const { data } = await apiClient.get(url);
      return data as any[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useZonePublicMenu(zoneId: string | null) {
  return useQuery({
    queryKey: ['zonePublicMenu', zoneId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/menu/items/zone/${zoneId}`);
      return data as any[];
    },
    enabled: !!zoneId,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Seller orders ─────────────────────────────────────────────────────────────

export function useSellerOrders(filters?: { status?: string; zoneId?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.zoneId) params.set('zoneId', filters.zoneId);
  const query = params.toString();

  return useQuery({
    queryKey: ['sellerOrders', filters],
    queryFn: async () => {
      const { data } = await apiClient.get(`/orders/admin/list${query ? `?${query}` : ''}`);
      return data as any[];
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useSellerUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const { data } = await apiClient.patch(`/orders/admin/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerOrders'] });
    },
  });
}
