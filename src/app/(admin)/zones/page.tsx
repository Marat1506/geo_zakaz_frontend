'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useServiceZones, useDeleteServiceZone } from '@/lib/hooks/use-geo';
import { ServiceZone } from '@/types/geo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';

const ServiceZoneForm = dynamic(
  () => import('@/components/features/service-zone-form').then((mod) => mod.ServiceZoneForm),
  { ssr: false, loading: () => <div className="h-0 overflow-hidden" /> }
);

// Normalize zone from API (may return snake_case from DB)
function normalizeZone(z: Record<string, unknown>): ServiceZone {
  return {
    id: String(z.id),
    name: String(z.name),
    type: (z.type as 'circle' | 'polygon') || 'circle',
    active: Boolean(z.active),
    centerLat: z.centerLat != null ? Number(z.centerLat) : (z.center_lat != null ? Number(z.center_lat) : undefined),
    centerLng: z.centerLng != null ? Number(z.centerLng) : (z.center_lng != null ? Number(z.center_lng) : undefined),
    radiusMeters: z.radiusMeters != null ? Number(z.radiusMeters) : (z.radius_meters != null ? Number(z.radius_meters) : undefined),
    polygonCoordinates: z.polygonCoordinates ?? z.polygon_coordinates,
  };
}

export default function ServiceZonesPage() {
  const { data: zonesData, isLoading, error: zonesError } = useServiceZones();
  const deleteZone = useDeleteServiceZone();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ServiceZone | null>(null);

  const zones = Array.isArray(zonesData)
    ? zonesData
        .map((z) => (typeof z === 'object' && z !== null ? normalizeZone(z as unknown as Record<string, unknown>) : null))
        .filter((z): z is ServiceZone => z !== null)
    : [];

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service zone?')) {
      return;
    }

    try {
      await deleteZone.mutateAsync(id);
      toast({
        title: 'Success',
        description: 'Service zone deleted successfully',
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to delete service zone. It may have existing orders — deactivate the zone instead.';
      toast({
        title: 'Cannot delete zone',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (zone: ServiceZone) => {
    setEditingZone(zone);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingZone(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingZone(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (zonesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-2 border-amber-200 bg-amber-50/80">
          <CardContent className="py-8 text-center">
            <p className="text-amber-800 font-medium mb-2">Could not load service zones</p>
            <p className="text-sm text-amber-700 mb-4">Check your connection and try again.</p>
            <Button variant="outline" className="border-amber-400 text-amber-800" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Zones</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Zone
        </Button>
      </div>

      <div className="grid gap-4">
        {zones.length > 0 ? (
          zones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{zone.name}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">
                        {zone.type === 'circle' ? 'Circle' : 'Polygon'}
                      </Badge>
                      <Badge variant={zone.active ? 'default' : 'secondary'}>
                        {zone.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(zone)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(zone.id)}
                      disabled={deleteZone.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {zone.type === 'circle' && zone.centerLat != null && zone.centerLng != null ? (
                  <div className="text-sm text-gray-600">
                    <p>Center: {Number(zone.centerLat).toFixed(6)}, {Number(zone.centerLng).toFixed(6)}</p>
                    <p>Radius: {Number(zone.radiusMeters ?? 0)} meters</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    <p>Polygon zone</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No service zones found. Create one to get started.
            </CardContent>
          </Card>
        )}
      </div>

      <ServiceZoneForm
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        zone={editingZone}
      />
    </div>
  );
}
