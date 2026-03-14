import { apiClient } from '../client';
import { Location, GeoCheckResponse, ServiceZone } from '@/types/geo';

export const geoApi = {
  checkLocation: async (location: Location): Promise<GeoCheckResponse> => {
    // Transform latitude/longitude to lat/lng for backend
    const { data } = await apiClient.post('/geo/check', {
      lat: location.latitude,
      lng: location.longitude,
    });
    return data;
  },

  getServiceZones: async (): Promise<ServiceZone[]> => {
    const { data } = await apiClient.get('/geo/admin/zones');
    return data;
  },

  createServiceZone: async (zone: any): Promise<ServiceZone> => {
    // Transform frontend format to backend DTO format
    let payload: any;
    
    if (zone.type === 'circle') {
      // Handle both formats: { center, radius } and { coordinates: { center, radius } }
      const center = zone.center || (zone.coordinates && zone.coordinates.center);
      const radius = zone.radius || (zone.coordinates && zone.coordinates.radius);
      
      payload = {
        name: zone.name,
        type: zone.type,
        centerLat: center.latitude,
        centerLng: center.longitude,
        radiusMeters: radius,
      };
    } else if (zone.type === 'polygon') {
      const coords = zone.coordinates || zone.coords;
      payload = {
        name: zone.name,
        type: zone.type,
        polygonCoordinates: coords,
      };
    } else {
      payload = zone;
    }
    
    const { data } = await apiClient.post('/geo/admin/zones', payload);
    return data;
  },

  updateServiceZone: async (id: string, zone: any): Promise<ServiceZone> => {
    // Transform frontend format to backend DTO format
    let payload: any;
    
    if (zone.type === 'circle') {
      // Handle both formats: { center, radius } and { coordinates: { center, radius } }
      const center = zone.center || (zone.coordinates && zone.coordinates.center);
      const radius = zone.radius || (zone.coordinates && zone.coordinates.radius);
      
      payload = {
        name: zone.name,
        type: zone.type,
        centerLat: center.latitude,
        centerLng: center.longitude,
        radiusMeters: radius,
      };
    } else if (zone.type === 'polygon') {
      const coords = zone.coordinates || zone.coords;
      payload = {
        name: zone.name,
        type: zone.type,
        polygonCoordinates: coords,
      };
    } else {
      payload = zone;
    }
    
    const { data } = await apiClient.patch(`/geo/admin/zones/${id}`, payload);
    return data;
  },

  deleteServiceZone: async (id: string): Promise<void> => {
    await apiClient.delete(`/geo/admin/zones/${id}`);
  },
};
