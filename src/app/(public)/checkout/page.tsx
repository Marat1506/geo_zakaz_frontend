'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShoppingBag, Camera, User } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const CAR_COLORS = [
  'Red', 'Blue', 'White', 'Black', 'Silver', 'Gray', 'Green', 'Yellow', 'Orange', 'Brown', 'Other'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, tax, deliveryFee, total } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login?redirect=/checkout');
    }
  }, [items.length, user, router]);

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
      alert('Please take a photo of your car');
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
      formData.append('carColor', data.carColor);
      if (data.parkingSpot) {
        formData.append('parkingSpot', data.parkingSpot);
      }
      
      // Add location (using Main Parking Lot zone coordinates)
      formData.append('customerLat', '40.7128');
      formData.append('customerLng', '-74.0060');
      
      // Add payment method
      formData.append('paymentMethod', 'cash');
      
      // Add customerId if user is logged in
      if (user) {
        formData.append('customerId', user.id);
      }
      
      // Add car photo
      formData.append('carPhoto', carPhoto);

      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.message || 'Failed to create order');
      }

      const order = await response.json();
      
      // Clear cart after successful order
      useCartStore.getState().clearCart();
      
      // Redirect to order tracking or success page
      router.push(`/order-success?orderId=${order.id}`);
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-orange-600 mb-8 text-center">Checkout</h1>

        {/* User Info */}
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
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
                    <Label htmlFor="carColor" className="text-lg font-semibold text-gray-700">
                      Car Color *
                    </Label>
                    <select
                      id="carColor"
                      {...register('carColor', { required: true })}
                      className="mt-2 w-full h-12 px-4 text-lg border-2 border-orange-300 rounded-md focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Select color</option>
                      {CAR_COLORS.map(color => (
                        <option key={color} value={color.toLowerCase()}>{color}</option>
                      ))}
                    </select>
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
                  disabled={isSubmitting}
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
