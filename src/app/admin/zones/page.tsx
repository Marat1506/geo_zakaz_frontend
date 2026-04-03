'use client';

import { useServiceZones } from '@/lib/hooks/use-geo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MapPin } from 'lucide-react';

export default function ServiceZonesPage() {
  const { data: zonesData, isLoading } = useServiceZones();

  const zones = Array.isArray(zonesData) ? zonesData : [];

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner /></div>;
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Service Zones</h1>
        <p className="text-sm text-gray-500 mt-1">Read-only overview of all seller zones</p>
      </div>

      {zones.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No service zones found</Card>
      ) : (
        <div className="grid gap-3">
          {zones.map((zone: any) => (
            <Card key={zone.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {zone.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{zone.type === 'circle' ? 'Circle' : 'Polygon'}</Badge>
                    <Badge variant={zone.active ? 'default' : 'secondary'}>
                      {zone.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                {zone.type === 'circle' && zone.centerLat != null ? (
                  <p>Center: {Number(zone.centerLat).toFixed(5)}, {Number(zone.centerLng).toFixed(5)} · Radius: {zone.radiusMeters}m</p>
                ) : (
                  <p>Polygon zone</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
