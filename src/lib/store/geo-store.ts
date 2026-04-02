import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '@/types/geo';

interface GeoState {
  userLocation: Location | null;
  inServiceZone: boolean;
  zoneId: string | null;
  zoneName: string | null;
  setLocation: (location: Location, inZone: boolean, zoneId?: string, zoneName?: string) => void;
  clearLocation: () => void;
}

export const useGeoStore = create<GeoState>()(
  persist(
    (set) => ({
      userLocation: null,
      inServiceZone: false,
      zoneId: null,
      zoneName: null,

      setLocation: (location, inZone, zoneId, zoneName) => {
        set({
          userLocation: location,
          inServiceZone: inZone,
          zoneId: zoneId || null,
          zoneName: zoneName || null,
        });
      },

      clearLocation: () => {
        set({
          userLocation: null,
          inServiceZone: false,
          zoneId: null,
          zoneName: null,
        });
      },
    }),
    {
      name: 'geo-storage',
      skipHydration: true,
    },
  ),
);
