'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePublicZones, useZonePublicMenu } from '@/lib/hooks/use-seller';
import { useCheckLocation } from '@/lib/hooks/use-geo';
import { useGeoStore } from '@/lib/store/geo-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ShoppingCart, User, LogIn, X, Clock, Plus, Lock, MapPin, Utensils, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils/image';
import { cn } from '@/lib/utils/cn';
import { Footer } from '@/components/layout/footer';
import { playSound } from '@/lib/utils/sounds';
import { Reviews } from '@/components/reviews/reviews';

const ZonesMap = dynamic(() => import('@/components/map/zones-map').then((m) => m.ZonesMap), {
  ssr: false,
  loading: () => <div className="w-full h-[50vh] bg-gray-100 flex items-center justify-center"><LoadingSpinner /></div>,
});

export default function HomePage() {
  const { data: zones = [], isLoading } = usePublicZones();
  const { user } = useAuthStore();
  const { addItem, items } = useCartStore();
  const { zoneId: currentZoneId, inServiceZone } = useGeoStore();
  const checkLocation = useCheckLocation();
  const router = useRouter();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);

  // Redirect admin/seller to their dashboards
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      router.replace('/admin/dashboard');
    } else if (user?.role === 'seller') {
      router.replace('/seller/dashboard');
    }
  }, [user, router]);

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { data: zoneMenu = [], isLoading: menuLoading } = useZonePublicMenu(selectedZoneId || currentZoneId);

  const showMapOnly = !inServiceZone && !selectedZoneId;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLocation({ lat, lng });
          checkLocation.mutate({ latitude: lat, longitude: lng });
        },
        () => { },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    if (inServiceZone && currentZoneId && !selectedZoneId) {
      setSelectedZoneId(currentZoneId);
    } else if (!inServiceZone && !selectedZoneId) {
      setSelectedZoneId(null);
    }
  }, [inServiceZone, currentZoneId]);

  const selectedZone = zones.find((z: any) => z.id === selectedZoneId);

  const handleAddToCart = (item: any) => {
    if (!user || user.role !== 'customer') {
      router.push('/login?redirect=/');
      return;
    }
    addItem({ ...item, price: Number(item.price) });
    playSound('cart_add');
  };

  const renderMap = () => (
    isLoading ? (
      <div className="h-full w-full flex items-center justify-center bg-gray-50"><LoadingSpinner /></div>
    ) : (
      <ZonesMap
        zones={zones}
        userLocation={userLocation}
        selectedZoneId={selectedZoneId}
        currentZoneId={currentZoneId}
        onZoneClick={(id) => setSelectedZoneId(id === selectedZoneId ? null : id)}
        height="100%"
        focusUserNearMe={!inServiceZone}
      />
    )
  );

  const renderMenu = () => (
    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          onClick={() => setSelectedZoneId(null)}
          className="hover:bg-orange-100 text-gray-400 hover:text-orange-600"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {menuLoading ? (
        <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
      ) : zoneMenu.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
          <CardContent className="py-16 text-center text-gray-500">
            <Utensils className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-lg">No items available in this zone yet.</p>
            <p className="text-sm">Check back later or try another zone!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
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
                {item.averageRating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-sm font-semibold text-gray-700">{Number(item.averageRating).toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({item.reviewCount || 0})</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span>{item.preparationTime} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-orange-400" />
                    <span>Freshly made</span>
                  </div>
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
                  className="min-h-[48px] px-6 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all hover:scale-105 active:scale-95"
                >
                  {(!user || user.role !== 'customer') && <Lock className="h-4 w-4 mr-2" />}
                  {user?.role === 'customer' ? (
                    <>
                      <Plus className="h-5 w-5 mr-1" />
                      Add to Cart
                    </>
                  ) : 'Login as Customer'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex flex-col">
      <header className="bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white drop-shadow">🍔 LotFood</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/profile">
                <Button variant="outline" className="min-h-[48px] bg-white hover:bg-yellow-50 border-2 border-white px-3 gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  <span className="hidden sm:inline text-orange-600 font-semibold text-sm">{user.name || 'Profile'}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="min-h-[48px] bg-white hover:bg-yellow-50 border-2 border-white px-3 gap-2">
                  <LogIn className="h-5 w-5 text-orange-600" />
                  <span className="hidden sm:inline text-orange-600 font-semibold text-sm">Login</span>
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button variant="outline" className="relative min-h-[48px] min-w-[48px] bg-white hover:bg-yellow-50 border-2 border-white">
                <ShoppingCart className="h-6 w-6 text-orange-600" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white font-bold text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8 flex flex-col">
        {inServiceZone ? (
          <>
            {/* 1. Status message (Top when in zone) */}
            <div className="text-center space-y-2 order-1">
              <div className="bg-green-50 py-4 px-8 rounded-3xl border-2 border-green-100 shadow-sm inline-block animate-in fade-in zoom-in duration-500">
                <p className="text-lg text-green-700 font-black flex items-center gap-2 justify-center">
                  <span className="text-2xl">✅</span> You are in a delivery zone!
                </p>
                <p className="text-sm text-green-600 font-medium">Order now from the delicious menu below.</p>
              </div>
              <p className="text-xs text-gray-400 font-medium pt-2">
                {zones.length === 0 ? 'No delivery zones available yet.' : `${zones.length} active delivery zones found.`}
              </p>
            </div>

            {/* 2. Zone menu panel (Middle when in zone) */}
            {selectedZoneId && (
              <div className="order-2">
                {renderMenu()}
              </div>
            )}

            {/* 3. Map (Bottom when in zone) */}
            <div className="space-y-4 order-3 pt-8 border-t-2 border-orange-100/50">
              <div className="text-center">
                <h2 className="text-2xl font-black text-gray-900 drop-shadow-sm mb-1">
                  Our Delivery Map
                </h2>
                <p className="text-gray-500 text-sm">
                  You are currently in the <span className="text-green-600 font-bold">{selectedZone?.name}</span> area.
                </p>
              </div>
              <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-2 ring-orange-100/50 h-[40vh] isolate">
                {renderMap()}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 1. Map (Top when OUTSIDE zone) */}
            <div className={cn("space-y-4 transition-all duration-500 order-1", showMapOnly && "py-10 max-w-5xl mx-auto")}>
              <div className="text-center">
                <h2 className="text-3xl font-black text-gray-900 drop-shadow-sm mb-2">
                  {showMapOnly ? 'Select a delivery zone' : 'Delivery Areas'}
                </h2>
                <p className="text-gray-600 text-base max-w-2xl mx-auto">
                  {showMapOnly
                    ? 'We detected you are currently outside our active zones. Choose a zone on the map to see the available menu!'
                    : 'We are delivering in these areas. Click on a zone to explore its menu.'}
                </p>
              </div>
              <div className={cn(
                "rounded-3xl overflow-hidden shadow-2xl border-8 border-white ring-4 ring-orange-100/50 transition-all duration-700 isolate",
                showMapOnly ? "h-[65vh]" : "h-[45vh]"
              )}>
                {renderMap()}
              </div>
            </div>

            {/* 2. Status message (Middle when OUTSIDE zone) */}
            <div className="text-center space-y-2 order-2">
              {!userLocation && !checkLocation.isPending && (
                <p className="text-sm text-blue-600 font-bold bg-blue-50 py-3 px-4 rounded-xl border-2 border-blue-100 shadow-sm inline-block">
                  📍 Allow location access to find delivery zones near you
                </p>
              )}
              {userLocation && (
                <div className="bg-orange-50 py-4 px-6 rounded-2xl border-2 border-orange-100 shadow-sm max-w-lg mx-auto">
                  <p className="text-sm text-orange-700 font-bold mb-1">
                    🏠 You are currently outside our delivery zones
                  </p>
                  <p className="text-xs text-orange-600">
                    But don't worry! You can still explore our menu by clicking on any zone on the map above.
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 font-medium pt-2">
                {zones.length === 0 ? 'No delivery zones available yet.' : `${zones.length} active delivery zones found.`}
              </p>
            </div>

            {/* 3. Zone menu panel (Bottom when OUTSIDE zone) */}
            {selectedZoneId && (
              <div className="order-3">
                {renderMenu()}
              </div>
            )}

            {/* Placeholder if nothing selected and not in zone */}
            {showMapOnly && !isLoading && (
              <div className="py-20 text-center space-y-6 order-4">
                <div className="bg-orange-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <MapPin className="h-12 w-12 text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 italic">"Where should we deliver today?"</h3>
                <p className="text-gray-500 max-w-sm mx-auto font-medium">
                  We are currently serving multiple zones. Tap any zone on the map to see its exclusive menu.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    <Footer />
    </>
  );
}
