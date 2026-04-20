'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { ServiceZone } from '@/types/geo';
import { serviceZoneSchema, ServiceZoneFormData } from '@/lib/validations/zone';
import {
  useCreateServiceZone,
  useUpdateServiceZone,
} from '@/lib/hooks/use-geo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { Plus, Trash2, Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const ZonePickerMap = dynamic(
  () => import('@/components/map/zone-picker-map').then((mod) => mod.ZonePickerMap),
  { ssr: false, loading: () => <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center"><p>Loading map...</p></div> }
);

interface ServiceZoneFormProps {
  isOpen: boolean;
  onClose: () => void;
  zone?: ServiceZone | null;
}

export function ServiceZoneForm({ isOpen, onClose, zone }: ServiceZoneFormProps) {
  const createZone = useCreateServiceZone();
  const updateZone = useUpdateServiceZone();
  const [zoneType, setZoneType] = useState<'circle' | 'polygon'>('circle');
  const [locating, setLocating] = useState(false);
  const [geoCenter, setGeoCenter] = useState<{ latitude: number; longitude: number } | null>(null);
  const userInteractedRef = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<ServiceZoneFormData>({
    resolver: zodResolver(serviceZoneSchema),
    defaultValues: {
      name: '',
      type: 'circle',
      center: { latitude: 0, longitude: 0 },
      radius: 700,
      active: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'coordinates' as never,
  });

  // Watch the type field
  const watchType = watch('type');

  useEffect(() => {
    if (watchType) {
      setZoneType(watchType);
    }
  }, [watchType]);

  useEffect(() => {
    if (!isOpen) return;

    // Reset interaction ref when opening
    userInteractedRef.current = false;

    if (zone) {
      // Editing existing zone
      setZoneType(zone.type);

      if (zone.type === 'circle') {
        reset({
          name: zone.name,
          type: 'circle',
          center: {
            latitude: zone.centerLat ?? 40.758,
            longitude: zone.centerLng ?? -73.9855,
          },
          radius: zone.radiusMeters ?? 700,
          active: zone.active,
        });
      } else if (zone.type === 'polygon') {
        const coords = Array.isArray(zone.polygonCoordinates) ? zone.polygonCoordinates : [];
        reset({
          name: zone.name,
          type: 'polygon',
          coordinates: coords,
          active: zone.active,
        });
      }
    } else {
      // Creating new zone
      reset({
        name: '',
        type: 'circle',
        center: { latitude: 0, longitude: 0 },
        radius: 1000,
        active: true,
      });
      setZoneType('circle');
      setGeoCenter(null);

      // Only attempt geolocation if we are creating a new zone and haven't set a center yet
      if (navigator.geolocation) {
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            // Only update if the user hasn't interacted yet
            if (userInteractedRef.current) {
              setLocating(false);
              return;
            }

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            setValue('center.latitude', lat);
            setValue('center.longitude', lng);
            setGeoCenter({ latitude: lat, longitude: lng });
            setLocating(false);
          },
          () => setLocating(false),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }
  }, [isOpen, zone, reset]);

  const onSubmit = async (data: ServiceZoneFormData) => {
    try {
      if (zone) {
        // Update existing zone
        await updateZone.mutateAsync({
          id: zone.id,
          zone: data,
        });
        toast({
          title: 'Success',
          description: 'Service zone updated successfully',
        });
      } else {
        // Create new zone
        await createZone.mutateAsync(data as Omit<ServiceZone, 'id'>);
        toast({
          title: 'Success',
          description: 'Service zone created successfully',
        });
      }
      onClose();
    } catch {
      toast({
        title: 'Error',
        description: zone
          ? 'Failed to update service zone'
          : 'Failed to create service zone',
        variant: 'destructive',
      });
    }
  };

  const handleTypeChange = (newType: 'circle' | 'polygon') => {
    setZoneType(newType);
    setValue('type', newType);

    // Reset coordinates when changing type
    if (newType === 'circle') {
      setValue('center', { latitude: 0, longitude: 0 });
      setValue('radius', 700);
    } else {
      setValue('coordinates' as never, [
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 0 },
      ] as never);
    }
  };

  const addCoordinate = () => {
    append({ latitude: 0, longitude: 0 } as never);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {zone ? 'Edit Service Zone' : 'Create New Service Zone'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Zone Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter zone name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">Zone Type</Label>
            <select
              id="type"
              value={zoneType}
              onChange={(e) => handleTypeChange(e.target.value as 'circle' | 'polygon')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="circle">Circle</option>
              <option value="polygon">Polygon</option>
            </select>
            {errors.type && (
              <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
            )}
          </div>

          {zoneType === 'circle' ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Your location will be used as the zone center</Label>
                  {locating && (
                    <span className="flex items-center gap-1 text-xs text-orange-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Detecting location...
                    </span>
                  )}
                </div>
                <ZonePickerMap
                  center={geoCenter ?? watch('center')}
                  radius={700}
                  onLocationSelect={() => {}}
                />
                <p className="text-xs text-gray-500 mt-1">
                  The zone will be created at your current location with a fixed radius of 700 meters.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
              </div>
            </>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Polygon Coordinates (minimum 3 points)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCoordinate}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Point
                </Button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          step="any"
                          {...register(`coordinates.${index}.latitude` as never, {
                            valueAsNumber: true,
                          })}
                          placeholder="Latitude"
                        />
                        {(() => {
                          const coordsErrors = (errors as Record<string, unknown>).coordinates;
                          if (coordsErrors && Array.isArray(coordsErrors) && coordsErrors[index] && typeof coordsErrors[index] === 'object') {
                            const latError = (coordsErrors[index] as Record<string, { message?: string }>)?.latitude?.message;
                            if (latError) {
                              return <p className="text-sm text-red-500 mt-1">{latError}</p>;
                            }
                          }
                          return null;
                        })()}
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="any"
                          {...register(`coordinates.${index}.longitude` as never, {
                            valueAsNumber: true,
                          })}
                          placeholder="Longitude"
                        />
                        {(() => {
                          const coordsErrors = (errors as Record<string, unknown>).coordinates;
                          if (coordsErrors && Array.isArray(coordsErrors) && coordsErrors[index] && typeof coordsErrors[index] === 'object') {
                            const lonError = (coordsErrors[index] as Record<string, { message?: string }>)?.longitude?.message;
                            if (lonError) {
                              return <p className="text-sm text-red-500 mt-1">{lonError}</p>;
                            }
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    {fields.length > 3 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {(() => {
                const coordsError = (errors as Record<string, { message?: string }>).coordinates?.message;
                if (coordsError && typeof coordsError === 'string') {
                  return <p className="text-sm text-red-500 mt-1">{coordsError}</p>;
                }
                return null;
              })()}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              {...register('active')}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Active
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createZone.isPending || updateZone.isPending}
            >
              {createZone.isPending || updateZone.isPending
                ? 'Saving...'
                : zone
                  ? 'Update Zone'
                  : 'Create Zone'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
