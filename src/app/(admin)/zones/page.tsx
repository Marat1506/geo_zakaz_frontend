'use client';

import { useState } from 'react';
import { useServiceZones, useDeleteServiceZone } from '@/lib/hooks/use-geo';
import { ServiceZone } from '@/types/geo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ServiceZoneForm } from '@/components/features/service-zone-form';
import { toast } from '@/components/ui/toast';

export default function ServiceZonesPage() {
  const { data: zones, isLoading } = useServiceZones();
  const deleteZone = useDeleteServiceZone();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ServiceZone | null>(null);

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
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete service zone',
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
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
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
        {zones && zones.length > 0 ? (
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
                {zone.type === 'circle' && typeof zone.coordinates === 'object' && 'center' in zone.coordinates ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      Center: {zone.coordinates.center.latitude.toFixed(6)},{' '}
                      {zone.coordinates.center.longitude.toFixed(6)}
                    </p>
                    <p>Radius: {zone.coordinates.radius} meters</p>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      {Array.isArray(zone.coordinates)
                        ? `${zone.coordinates.length} coordinate points`
                        : 'Invalid coordinates'}
                    </p>
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
