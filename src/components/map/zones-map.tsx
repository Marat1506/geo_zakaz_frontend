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

interface ZonesMapProps {
  zones: Zone[];
  userLocation?: { lat: number; lng: number } | null;
  selectedZoneId?: string | null;
  currentZoneId?: string | null;
  onZoneClick?: (zoneId: string) => void;
  height?: string;
}

export function ZonesMap({ zones, userLocation, selectedZoneId, currentZoneId, onZoneClick, height = '50vh' }: ZonesMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Map<string, L.Layer>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
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
      const map = L.map('zones-map', {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([20, 0], 2);

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

    const bounds: L.LatLngBoundsExpression[] = [];

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
        bounds.push(circle.getBounds() as any);
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
        bounds.push(polygon.getBounds() as any);
      }
    });

    if (bounds.length > 0 && !selectedZoneId) {
      try {
        const allBounds = L.latLngBounds(bounds.flat() as any);
        map.fitBounds(allBounds, { padding: [40, 40] });
      } catch { }
    }
  }, [isClient, zones, selectedZoneId, onZoneClick]);

  // Pan to selected zone
  useEffect(() => {
    if (!isClient || !mapRef.current || !selectedZoneId) return;
    const layer = layersRef.current.get(selectedZoneId);
    if (layer && (layer as any).getBounds) {
      mapRef.current.fitBounds((layer as any).getBounds(), { padding: [40, 40] });
    }
  }, [isClient, selectedZoneId]);

  // User location marker
  useEffect(() => {
    if (!isClient || !mapRef.current || !userLocation) return;
    const map = mapRef.current;

    const icon = L.divIcon({
      html: '<div style="width:14px;height:14px;background:#22c55e;border:3px solid white;border-radius:50%;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
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
  }, [isClient, userLocation]);

  if (!isClient) return <div style={{ height }} className="bg-gray-100 flex items-center justify-center"><span className="text-gray-500">Loading map...</span></div>;

  return (
    <div id="zones-map" style={{ height, width: '100%' }} />
  );
}
