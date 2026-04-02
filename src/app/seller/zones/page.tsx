'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSellerZones, useDeleteSellerZone } from '@/lib/hooks/use-seller';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Edit, Trash2, MapPin, Layers } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ServiceZoneForm = dynamic(
  () => import('@/components/features/service-zone-form').then((m) => m.ServiceZoneForm),
  { ssr: false, loading: () => <div className="h-0" /> }
);

function normalizeZone(z: Record<string, unknown>) {
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

export default function SellerZonesPage() {
  const { data: zonesData, isLoading } = useSellerZones();
  const deleteZone = useDeleteSellerZone();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const zones = Array.isArray(zonesData)
    ? zonesData.map((z) => normalizeZone(z as Record<string, unknown>))
    : [];

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteZone.mutateAsync(confirmDeleteId);
      toast({ title: 'Deleted', description: 'Zone and all its products have been deleted successfully.' });
      setConfirmDeleteId(null);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete zone.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
          <p className="text-sm text-gray-500 mt-1">Manage areas where you provide delivery</p>
        </div>
        <Button
          onClick={() => { setEditing(null); setIsOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Zone
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {zones.length === 0 ? (
          <Card className="col-span-full border-dashed border-2 border-orange-100 bg-orange-50/30">
            <CardContent className="py-12 text-center">
              <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No zones yet</h3>
              <p className="text-gray-500 max-w-xs mx-auto mt-1">Create your first zone to start accepting orders from customers in that area.</p>
              <Button
                onClick={() => { setEditing(null); setIsOpen(true); }}
                variant="outline"
                className="mt-6 border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                Create First Zone
              </Button>
            </CardContent>
          </Card>
        ) : zones.map((zone) => (
          <Card key={zone.id} className="overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-orange-50 bg-orange-50/20">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    {zone.type === 'circle' ? <MapPin className="h-5 w-5" /> : <Layers className="h-5 w-5" />}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900">{zone.name}</CardTitle>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="bg-white border-orange-100 text-orange-700 capitalize">
                        {zone.type}
                      </Badge>
                      <Badge className={zone.active ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-100'}>
                        {zone.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditing(zone); setIsOpen(true); }}
                    className="h-9 w-9 text-gray-500 hover:text-orange-600 hover:bg-orange-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setConfirmDeleteId(zone.id)}
                    disabled={deleteZone.isPending}
                    className="h-9 w-9 text-gray-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm text-gray-600">
                {zone.type === 'circle' && zone.centerLat != null && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="font-medium">{Number(zone.centerLat).toFixed(5)}, {Number(zone.centerLng).toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Radius:</span>
                      <span className="font-medium">{zone.radiusMeters} meters</span>
                    </div>
                  </>
                )}
                {zone.type === 'polygon' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shape:</span>
                    <span className="font-medium">Custom Polygon</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ServiceZoneForm isOpen={isOpen} onClose={() => { setIsOpen(false); setEditing(null); }} zone={editing} />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete Zone?"
        description="Are you sure you want to delete this delivery zone? This will also remove the link to this zone from all products and orders."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="danger"
        isLoading={deleteZone.isPending}
      />
    </div>
  );
}
