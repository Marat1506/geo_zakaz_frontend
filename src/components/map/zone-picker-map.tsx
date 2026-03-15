'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ZonePickerMapProps {
  center?: { latitude: number; longitude: number };
  radius?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onRadiusChange?: (radius: number) => void;
}

export function ZonePickerMap({
  center,
  radius = 1000,
  onLocationSelect,
  onRadiusChange,
}: ZonePickerMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Fix for default marker icons (must run client-side only)
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

    const initialCenter: [number, number] = center && !isNaN(center.latitude) && !isNaN(center.longitude)
      ? [center.latitude, center.longitude]
      : [40.7580, -73.9855]; // Default to Times Square

    // Initialize map
    if (!mapRef.current) {
      const map = L.map('zone-picker-map').setView(initialCenter, 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // Add click handler to map
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);

        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        // Update or create circle
        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng]);
        } else {
          circleRef.current = L.circle([lat, lng], {
            radius: radius,
            color: '#f97316',
            fillColor: '#f97316',
            fillOpacity: 0.2,
          }).addTo(map);
        }
      });
    }

    // Update marker and circle when center or radius changes
    if (center && !isNaN(center.latitude) && !isNaN(center.longitude) && mapRef.current) {
      const latLng: [number, number] = [center.latitude, center.longitude];

      if (markerRef.current) {
        markerRef.current.setLatLng(latLng);
      } else {
        markerRef.current = L.marker(latLng).addTo(mapRef.current);
      }

      if (circleRef.current) {
        circleRef.current.setLatLng(latLng);
        circleRef.current.setRadius(radius);
      } else {
        circleRef.current = L.circle(latLng, {
          radius: radius,
          color: '#f97316',
          fillColor: '#f97316',
          fillOpacity: 0.2,
        }).addTo(mapRef.current);
      }

      mapRef.current.setView(latLng, 13);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [isClient, center, radius, onLocationSelect]);

  if (!isClient) {
    return (
      <div className="w-full h-[400px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        id="zone-picker-map"
        className="w-full h-[400px] rounded-lg border border-gray-300 dark:border-gray-700"
      />
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click on the map to select the center of your delivery zone
      </p>
    </div>
  );
}
