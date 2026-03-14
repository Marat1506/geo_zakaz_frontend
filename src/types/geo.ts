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
  type: "circle" | "polygon";
  coordinates: Location[] | { center: Location; radius: number };
  active: boolean;
}
