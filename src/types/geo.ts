export interface Location {
  latitude: number;
  longitude: number;
}

export interface GeoCheckResponse {
  inServiceZone: boolean;
  zoneName?: string;
  message?: string;
}

export interface ServiceZone {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  // For circle zones
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  // For polygon zones
  polygonCoordinates?: any;
  active: boolean;
}
