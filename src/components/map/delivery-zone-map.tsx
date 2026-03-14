'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface DeliveryZone {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}

interface DeliveryZoneMapProps {
  zones: DeliveryZone[];
  userLocation?: { lat: number; lng: number };
  height?: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export function DeliveryZoneMap({ zones, userLocation, height = '400px' }: DeliveryZoneMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  // Calculate center point (use first zone or user location)
  const defaultCenter: [number, number] = zones.length > 0 
    ? [zones[0].centerLat, zones[0].centerLng]
    : [40.7128, -74.0060]; // Default to NYC

  const center: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <MapUpdater center={center} zoom={13} />
        
        {/* OpenStreetMap tiles (free, no API key needed) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Delivery zones */}
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.centerLat, zone.centerLng]}
            radius={zone.radiusMeters}
            pathOptions={{
              color: '#f97316',
              fillColor: '#fb923c',
              fillOpacity: 0.2,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{zone.name}</p>
                <p className="text-sm text-gray-600">
                  Delivery Zone ({zone.radiusMeters}m radius)
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
