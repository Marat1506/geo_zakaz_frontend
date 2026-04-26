'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useZonePublicMenu, usePublicZones } from '@/lib/hooks/use-seller';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { useGeoStore } from '@/lib/store/geo-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { X, Clock, Plus, Lock, Utensils, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils/image';
import { apiClient } from '@/lib/api/client';
import { cn } from '@/lib/utils/cn';
import { playSound } from '@/lib/utils/sounds';
import { Footer } from '@/components/layout/footer';
import { toast } from '@/components/ui/toast';
import { Header } from '@/components/layout/header';

const ZonesMap = dynamic(() => import('@/components/map/zones-map').then((m) => m.ZonesMap), {
  ssr: false,
  loading: () => <div className="w-full h-[50vh] bg-gray-100 flex items-center justify-center"><LoadingSpinner /></div>,
});

interface SellerInfo {
  id: string;
  name: string;
  shopName: string;
  shopDescription: string;
  shopLogo: string;
  contactPhone: string;
  contactEmail: string;
  slug: string;
}

interface PublicZone {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  centerLat?: number;
  centerLng?: number;
  radiusMeters?: number;
  polygonCoordinates?: any;
  active?: boolean;
  sellerId?: string;
}

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const slug = params.slug as string;

  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationIssue, setLocationIssue] = useState<string | null>(null);
  const { setLocation } = useGeoStore();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const { data: zones = [], isLoading: zonesLoading } = usePublicZones();

  useEffect(() => {
    loadSeller();
  }, [slug]);

  useEffect(() => {
    if (!seller || zonesLoading) return;

    const sellerZones = (zones as PublicZone[]).filter((zone) => zone.sellerId === seller.id);
    if (sellerZones.length === 0) {
      setLocationIssue('No active delivery zones are configured for this seller yet.');
      setIsCheckingLocation(false);
      return;
    }

    verifyLocationForSeller(seller.id, sellerZones);
  }, [seller, zonesLoading, zones, router]);

  const verifyLocationForSeller = async (sellerId: string, sellerZones: PublicZone[]) => {
    if (!navigator.geolocation) {
      setLocationIssue('Geolocation is not supported on your device/browser.');
      setIsCheckingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation({ lat, lng });

        try {
          const { data } = await apiClient.post<{
            inZone?: boolean;
            zoneId?: string;
            zoneName?: string;
            sellerId?: string;
          }>('/geo/check', { lat, lng });

          const inZone = Boolean(data?.inZone);
          const zoneId = data?.zoneId;
          const zoneName = data?.zoneName;
          setLocation({ latitude: lat, longitude: lng }, inZone, zoneId, zoneName);

          const isSellerZone = inZone && zoneId && data?.sellerId === sellerId;
          const selectedId = isSellerZone
            ? zoneId
            : sellerZones[0]?.id || null;

          if (!isSellerZone) {
            setLocationIssue('You are outside this seller delivery zone. Ordering is unavailable.');
            setSelectedZoneId(selectedId);
            setIsCheckingLocation(false);
            return;
          }

          setLocationIssue(null);
          setSelectedZoneId(selectedId);
          setIsCheckingLocation(false);
        } catch {
          setLocationIssue('Failed to verify your location. Please try again.');
          setIsCheckingLocation(false);
        }
      },
      () => {
        setLocationIssue('Location permission is required to order from this seller.');
        setIsCheckingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const loadSeller = async () => {
    try {
      const response = await apiClient.get<SellerInfo>(`/auth/seller/slug/${slug}`);
      setSeller(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Seller not found');
    } finally {
      setLoading(false);
    }
  };

  const sellerZones = (zones as PublicZone[]).filter((zone) => zone.sellerId === seller?.id);
  const { data: zoneMenu = [], isLoading: menuLoading } = useZonePublicMenu(selectedZoneId);
  const selectedZone = sellerZones.find((z) => z.id === selectedZoneId);

  const handleAddToCart = (item: any) => {
    if (!user || user.role !== 'customer') {
      router.push(`/login?redirect=${encodeURIComponent(pathname || `/ref/${slug}`)}`);
      return;
    }
    addItem({ ...item, price: Number(item.price) });
    playSound('cart_add');
    toast({ title: 'Added to cart!' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold mb-2">Seller Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'This seller does not exist or is not available.'}</p>
            <Link href="/">
              <Button className="bg-orange-500 hover:bg-orange-600">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (zonesLoading || isCheckingLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex flex-col">
      <Header
        sellerInfo={{
          shopName: seller.shopName || seller.name,
          shopDescription: seller.shopDescription || '',
          shopLogo: seller.shopLogo || '',
        }}
      />

      <div className="container mx-auto px-4 py-6 space-y-8 flex flex-col">
        <div className="text-center space-y-2">
          <div className="bg-green-50 py-4 px-8 rounded-3xl border-2 border-green-100 shadow-sm inline-block">
            <p className="text-lg text-green-700 font-black">✅ You are in {seller.shopName || seller.name} delivery area</p>
            <p className="text-sm text-green-600 font-medium">Choose dishes below and place your order.</p>
          </div>
          {selectedZone && (
            <p className="text-xs text-gray-500 font-medium">
              Active zone: <span className="text-orange-600 font-bold">{selectedZone.name}</span>
            </p>
          )}
        </div>

        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between border-b-2 border-orange-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-orange-500 rounded-full" />
              <h2 className="text-2xl font-black text-gray-900">
                {selectedZone?.name || 'Zone'} Menu
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedZoneId(sellerZones[0]?.id || null)}
              className={cn(
                'hover:bg-orange-100 text-gray-400 hover:text-orange-600',
                !selectedZoneId && 'opacity-50'
              )}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {locationIssue ? (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardContent className="py-10 text-center text-gray-700">
                <p className="font-semibold text-lg mb-2">{locationIssue}</p>
                <p className="text-sm text-gray-600 mb-4">
                  Enable location access and refresh this page to continue.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600">
                    Retry location check
                  </Button>
                  <Link href="/">
                    <Button variant="outline">Go to home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : menuLoading ? (
            <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
          ) : zoneMenu.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
              <CardContent className="py-16 text-center text-gray-500">
                <Utensils className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium text-lg">No items available in this zone yet.</p>
                <p className="text-sm">Please try another zone on the map below.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
              {zoneMenu.map((item: any) => (
                <Card
                  key={item.id}
                  className="overflow-hidden flex flex-col border-orange-100 shadow-md hover:shadow-xl transition-all duration-300 group rounded-2xl cursor-pointer"
                  onClick={() => router.push(`/menu/${item.id}`)}
                >
                  {item.imageUrl ? (
                    <div className="h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-orange-50 flex items-center justify-center text-orange-200">
                      <Utensils className="h-16 w-16" />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </CardTitle>
                      <Badge className={item.available ? 'bg-green-500' : 'bg-gray-400'}>
                        {item.available ? 'Available' : 'Sold Out'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                      <Clock className="h-4 w-4 text-orange-400" />
                      <span>{item.preparationTime} min</span>
                    </div>
                  </CardContent>
                  <div className="px-5 pb-5 pt-2 flex justify-between items-center bg-orange-50/30 border-t border-orange-50">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Price</span>
                      <span className="text-2xl font-black text-orange-600">${Number(item.price).toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(item);
                      }}
                      disabled={!item.available}
                      className="min-h-[46px] px-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
                    >
                      {(!user || user.role !== 'customer') && <Lock className="h-4 w-4 mr-2" />}
                      {user?.role === 'customer' ? (
                        <>
                          <Plus className="h-5 w-5 mr-1" />
                          Add
                        </>
                      ) : 'Login as customer'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-6 border-t-2 border-orange-100/50">
          <div className="text-center">
            <h2 className="text-2xl font-black text-gray-900 drop-shadow-sm mb-1">
              Delivery Zones of {seller.shopName || seller.name}
            </h2>
            <p className="text-gray-500 text-sm">
              Tap a zone to switch menu.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-2 ring-orange-100/50 h-[40vh] isolate">
            <ZonesMap
              zones={sellerZones}
              userLocation={userLocation}
              selectedZoneId={selectedZoneId}
              currentZoneId={selectedZoneId}
              onZoneClick={(id) => setSelectedZoneId(id === selectedZoneId ? null : id)}
              height="100%"
            />
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
}
