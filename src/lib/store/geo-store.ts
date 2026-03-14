import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location } from '@/types/geo';

interface GeoState {
  userLocation: Location | null;
  inServiceZone: boolean;
  zoneName: string | null;
  setLocation: (location: Location, inZone: boolean, zoneName?: string) => void;
  clearLocation: () => void;
}

export const useGeoStore = create<GeoState>()(
  persist(
    (set) => ({
      userLocation: null,
      inServiceZone: false,
      zoneName: null,

      setLocation: (location, inZone, zoneName) => {
        set({
          userLocation: location,
          inServiceZone: inZone,
          zoneName: zoneName || null,
        });
      },

      clearLocation: () => {
        set({
          userLocation: null,
          inServiceZone: false,
          zoneName: null,
        });
      },
    }),
    {
      name: 'geo-storage',
    },
  ),
);
