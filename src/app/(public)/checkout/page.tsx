'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'; import { useCartStore } from '@/lib/store/cart-store'; import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShoppingBag, Camera, User, MapPin, AlertCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCheckLocation, usePublicServiceZones } from '@/lib/hooks/use-geo';
import { useGeoStore } from '@/lib/store/geo-store';
import { toast } from '@/components/ui/toast';
import { playSound } from '@/lib/utils/sounds';
import { apiClient } from '@/lib/api/client';

const DeliveryZoneMap = dynamic(
  () => import('@/components/map/delivery-zone-map').then((mod) => mod.DeliveryZoneMap),
  { ssr: false, loading: () => <div className="w-full h-[260px] bg-gray-100 rounded-lg flex items-center justify-center"><p className="text-gray-500">Loading map...</p></div> }
);

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax, deliveryFee, total } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userLocation, inServiceZone, zoneName } = useGeoStore();
  const checkLocation = useCheckLocation();
  const { data: serviceZones = [], isLoading: zonesLoading, isError: zonesError } = usePublicServiceZones();
  const [geoError, setGeoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
    // Guest -> login, authenticated non-customer -> own dashboard.
    if (!user) {
      router.push('/login?redirect=/checkout');
      return;
    }
    if (user.role === 'admin' || user.role === 'superadmin') {
      router.push('/admin/dashboard');
      return;
    }
    if (user.role === 'seller') {
      router.push('/seller/dashboard');
    }
  }, [items.length, user, router]);

  useEffect(() => {
    if (userLocation || checkLocation.isPending) return;

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setGeoError(null);
        checkLocation.mutate(coords);
      },
      () => {
        setGeoError('We could not detect your location. Enable geolocation to place an order.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, [userLocation, checkLocation]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCarPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    if (!carPhoto) {
      toast({
        title: 'Car photo required',
        description: 'Please take a photo of your car to continue.',
        variant: 'destructive',
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: 'Location required',
        description: 'Please allow geolocation to place an order.',
        variant: 'destructive',
      });
      return;
    }

    if (!inServiceZone) {
      toast({
        title: 'Outside delivery zone',
        description: 'Ordering is available only inside active seller delivery zones.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add order items as JSON string
      const orderItems = items.map(item => ({
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
      }));
      formData.append('items', JSON.stringify(orderItems));

      // Add car information
      formData.append('carPlateNumber', data.carPlateNumber);
      if (data.parkingSpot) {
        formData.append('parkingSpot', data.parkingSpot);
      }

      // Delivery is allowed only for users inside active service zones.
      formData.append('customerLat', String(userLocation.latitude));
      formData.append('customerLng', String(userLocation.longitude));

      // Add payment method
      formData.append('paymentMethod', 'cash');

      // Add car photo
      formData.append('carPhoto', carPhoto);
      const { data: order } = await apiClient.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      playSound('order_placed');
      // Clear cart after successful order
      useCartStore.getState().clearCart();

      // Redirect to order tracking or success page
      router.push(`/order-success?orderId=${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      playSound('error');
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      toast({
        title: 'Order failed',
        description: message || 'Failed to place order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 || !user || user.role !== 'customer') return null;

  const handleBackToCart = () => {
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToCart}
            className="text-orange-600 hover:bg-orange-100 font-bold gap-2 min-h-[48px]"
          >
            ← Back to Cart
          </Button>
          <h1 className="text-3xl md:text-4xl font-black text-orange-600 drop-shadow-sm">
            Checkout
          </h1>
          <div className="w-24 hidden md:block" /> {/* Spacer */}
        </div>

        <Card className="mb-6 border-2 border-orange-200 bg-white/80 shadow-lg overflow-hidden rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg text-gray-800">
              <MapPin className="h-5 w-5 text-orange-500" />
              Delivery zone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="w-full">
              <DeliveryZoneMap
                zones={serviceZones
                  .filter((z) => z.centerLat != null && z.centerLng != null && z.radiusMeters != null)
                  .map((z) => ({
                    id: z.id,
                    name: z.name,
                    centerLat: z.centerLat as number,
                    centerLng: z.centerLng as number,
                    radiusMeters: z.radiusMeters as number,
                  }))}
                userLocation={
                  userLocation
                    ? { lat: userLocation.latitude, lng: userLocation.longitude }
                    : undefined
                }
                height="260px"
              />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              {checkLocation.isPending && (
                <p className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                  Checking your position relative to our delivery zone...
                </p>
              )}
              {geoError && (
                <p className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  {geoError}
                </p>
              )}
              {!geoError && !checkLocation.isPending && userLocation && (
                <p
                  className={`flex items-center gap-2 ${inServiceZone ? 'text-emerald-700' : 'text-red-600'
                    }`}
                >
                  <AlertCircle
                    className={`h-4 w-4 ${inServiceZone ? 'text-emerald-500' : 'text-red-500'
                      }`}
                  />
                  {inServiceZone
                    ? `You are inside our delivery zone${zoneName ? ` (“${zoneName}”)` : ''}.`
                    : 'You are currently outside our delivery zone. Ordering is unavailable.'}
                </p>
              )}
              {zonesError && (
                <p className="text-xs text-gray-500">
                  We could not load delivery zones right now. Please try again later.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card className="mb-6 border-2 border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <User className="h-12 w-12 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Logged in as</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400">
                <CardTitle className="text-white text-2xl">Car Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(onSubmit)} id="checkout-form" className="space-y-6">
                  <div>
                    <Label htmlFor="carPlateNumber" className="text-lg font-semibold text-gray-700">
                      Car Plate Number *
                    </Label>
                    <Input
                      id="carPlateNumber"
                      {...register('carPlateNumber', { required: true })}
                      placeholder="ABC-1234"
                      className="mt-2 h-12 text-lg border-2 border-orange-300 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parkingSpot" className="text-lg font-semibold text-gray-700">
                      Parking Row/Spot (Optional)
                    </Label>
                    <Input
                      id="parkingSpot"
                      {...register('parkingSpot')}
                      placeholder="Row A, Spot 15"
                      className="mt-2 h-12 text-lg border-2 border-orange-300 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <Label className="text-lg font-semibold text-gray-700 block mb-3">
                      Car Photo *
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-16 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    >
                      <Camera className="mr-2 h-6 w-6" />
                      {carPhoto ? 'Change Photo' : 'Take Photo'}
                    </Button>
                    {photoPreview && (
                      <div className="mt-4 rounded-lg overflow-hidden border-4 border-orange-300">
                        <img src={photoPreview} alt="Car preview" className="w-full h-48 object-cover" />
                      </div>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-xl border-2 border-orange-200 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400">
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingBag className="h-6 w-6" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={item.menuItem.id} className="flex justify-between pb-3 border-b border-orange-200">
                      <div>
                        <p className="font-semibold text-gray-800">{item.menuItem.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-orange-600">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t-2 border-orange-300">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Delivery</span>
                    <span className="font-semibold">${deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-orange-400 pt-3 mt-3">
                    <div className="flex justify-between text-2xl font-bold text-orange-600">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  form="checkout-form"
                  className="w-full h-14 text-xl font-bold bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 shadow-lg"
                  disabled={isSubmitting || !userLocation || !inServiceZone}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
