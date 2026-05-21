'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Zone {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  polygonCoordinates?: any;
  active?: boolean;
}

const ZOOM_CITY = 13;
const ZOOM_ZONE = 14;
/** Minimum zoom — never leave the map at continent/world scale */
const ZOOM_MIN = 11;
const ZOOM_FALLBACK = 10;
const DEFAULT_CENTER: [number, number] = [47.2357, 39.7015];

function mergeBounds(boundsList: L.LatLngBounds[]): L.LatLngBounds | null {
  if (boundsList.length === 0) return null;
  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;
  for (const b of boundsList) {
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    south = Math.min(south, sw.lat);
    west = Math.min(west, sw.lng);
    north = Math.max(north, ne.lat);
    east = Math.max(east, ne.lng);
  }
  return L.latLngBounds([south, west], [north, east]);
}

function fitMapToBounds(map: L.Map, bounds: L.LatLngBounds, maxZoom = ZOOM_ZONE) {
  try {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom });
    if (map.getZoom() < ZOOM_MIN) {
      map.setZoom(ZOOM_MIN);
    }
  } catch {
    /* ignore invalid bounds */
  }
}

interface ZonesMapProps {
  zones: Zone[];
  userLocation?: { lat: number; lng: number } | null;
  selectedZoneId?: string | null;
  currentZoneId?: string | null;
  onZoneClick?: (zoneId: string) => void;
  height?: string;
  /** When true, avoid fitting the whole world to all zones; center on the user once geolocation is known (visitor outside coverage). */
  focusUserNearMe?: boolean;
}

export function ZonesMap({
  zones,
  userLocation,
  selectedZoneId,
  currentZoneId,
  onZoneClick,
  height = '50vh',
  focusUserNearMe = false,
}: ZonesMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Layer>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const didApplyViewRef = useRef(false);
  const prevSelectedZoneIdRef = useRef<string | null | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!mapRef.current) {
      const initialCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : DEFAULT_CENTER;
      const initialZoom = userLocation ? ZOOM_CITY : ZOOM_FALLBACK;

      const map = L.map('zones-map', {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(initialCenter, initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }

    // Update map size when container size changes
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current.clear();
        userMarkerRef.current = null;
      }
    };
  }, [isClient, height]);

  // Update zones on map
  useEffect(() => {
    if (!isClient || !mapRef.current) return;
    const map = mapRef.current;

    // Remove old layers
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current.clear();

    const zoneBoundsList: L.LatLngBounds[] = [];

    zones.forEach((zone) => {
      if (!zone.active) return;
      const isSelected = zone.id === selectedZoneId;
      const isCurrent = zone.id === currentZoneId;

      // Highlight current zone (where user is) with green, selected with orange, others with blue
      let color = '#3b82f6'; // default blue
      if (isSelected) color = '#f97316'; // orange
      if (isCurrent) color = '#22c55e'; // green

      const fillOpacity = isSelected || isCurrent ? 0.35 : 0.15;

      if (zone.type === 'circle' && zone.centerLat != null && zone.centerLng != null && zone.radiusMeters) {
        const circle = L.circle([Number(zone.centerLat), Number(zone.centerLng)], {
          radius: Number(zone.radiusMeters),
          color,
          fillColor: color,
          fillOpacity,
          weight: isSelected || isCurrent ? 3 : 2,
        }).addTo(map);

        if (isCurrent) {
          circle.bindTooltip(`${zone.name} (Your Area)`, { permanent: false, direction: 'center' });
        } else {
          circle.bindTooltip(`${zone.name} (Click to view menu)`, { permanent: false, direction: 'center' });
        }
        circle.on('click', () => onZoneClick?.(zone.id));

        layersRef.current.set(zone.id, circle);
        zoneBoundsList.push(circle.getBounds());
      } else if (zone.type === 'polygon' && zone.polygonCoordinates) {
        const polygon = L.polygon(zone.polygonCoordinates, {
          color,
          fillColor: color,
          fillOpacity,
          weight: isSelected || isCurrent ? 3 : 2,
        }).addTo(map);

        if (isCurrent) {
          polygon.bindTooltip(`${zone.name} (Your Area)`, { permanent: false, direction: 'center' });
        } else {
          polygon.bindTooltip(`${zone.name} (Click to view menu)`, { permanent: false, direction: 'center' });
        }
        polygon.on('click', () => onZoneClick?.(zone.id));

        layersRef.current.set(zone.id, polygon);
        zoneBoundsList.push(polygon.getBounds());
      }
    });

    const applyMapView = () => {
      if (selectedZoneId) {
        const layer = layersRef.current.get(selectedZoneId);
        if (layer && (layer as L.Circle | L.Polygon).getBounds) {
          const b = (layer as L.Circle | L.Polygon).getBounds();
          if (userLocation) {
            b.extend([userLocation.lat, userLocation.lng]);
          }
          fitMapToBounds(map, b);
          didApplyViewRef.current = true;
          return;
        }
      }

      if (userLocation) {
        map.flyTo([userLocation.lat, userLocation.lng], ZOOM_CITY, {
          animate: !didApplyViewRef.current,
          duration: 0.75,
        });
        didApplyViewRef.current = true;
        return;
      }

      const skipGlobalFit = focusUserNearMe || userLocation;
      if (zoneBoundsList.length > 0 && !selectedZoneId && !skipGlobalFit) {
        const merged = mergeBounds(zoneBoundsList);
        if (merged) {
          fitMapToBounds(map, merged);
          didApplyViewRef.current = true;
        }
      }
    };

    applyMapView();

    const resizeTimer = setTimeout(() => {
      if (!mapRef.current) return;
      mapRef.current.invalidateSize();
      if (userLocation || selectedZoneId) {
        applyMapView();
      }
    }, 200);

    return () => clearTimeout(resizeTimer);
  }, [isClient, zones, selectedZoneId, onZoneClick, focusUserNearMe, userLocation, currentZoneId]);

  // User location marker
  useEffect(() => {
    if (!isClient || !mapRef.current || !userLocation) return;
    const map = mapRef.current;

    if (prevSelectedZoneIdRef.current && !selectedZoneId) {
      didApplyViewRef.current = false;
    }
    prevSelectedZoneIdRef.current = selectedZoneId ?? null;

    const icon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
      className: '',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    } else {
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon })
        .addTo(map)
        .bindTooltip('You are here', { direction: 'top' });
    }

    const zoomTooWide = map.getZoom() < ZOOM_MIN;

    if (selectedZoneId) {
      const layer = layersRef.current.get(selectedZoneId);
      if (layer && (layer as L.Circle | L.Polygon).getBounds) {
        const b = (layer as L.Circle | L.Polygon).getBounds();
        b.extend([userLocation.lat, userLocation.lng]);
        if (zoomTooWide || !didApplyViewRef.current) {
          fitMapToBounds(map, b);
          didApplyViewRef.current = true;
        }
        return;
      }
    }

    if (zoomTooWide || !didApplyViewRef.current) {
      map.flyTo([userLocation.lat, userLocation.lng], ZOOM_CITY, {
        animate: didApplyViewRef.current,
        duration: 0.75,
      });
      didApplyViewRef.current = true;
    }
  }, [isClient, userLocation, selectedZoneId, zones.length]);

  if (!isClient) return <div style={{ height }} className="bg-gray-100 flex items-center justify-center"><span className="text-gray-500">Loading map...</span></div>;

  return (
    <div id="zones-map" style={{ height, width: '100%' }} />
  );
}
