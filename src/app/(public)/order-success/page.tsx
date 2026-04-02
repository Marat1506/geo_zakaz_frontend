'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/menu');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-2xl border-4 border-orange-300">
          <CardHeader className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-center py-8">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-20 w-20" />
            </div>
            <CardTitle className="text-3xl font-bold">Order Placed Successfully!</CardTitle>
            <p className="text-lg mt-2">Thank you for your order</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {order && (
              <>
                <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-orange-600 mb-3">Order Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order Number:</span>
                      <span className="font-bold text-gray-900">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-bold text-orange-600 text-xl">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600 uppercase">{order.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-blue-600">Estimated Time</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{order.estimatedTime} minutes</p>
                  <p className="text-sm text-gray-600 mt-1">We'll bring your order to your car</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="h-6 w-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-purple-600">Your Car</h3>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-900"><span className="font-semibold">Plate:</span> {order.carPlateNumber}</p>
                    <p className="text-gray-900"><span className="font-semibold">Color:</span> {order.carColor}</p>
                    {order.parkingSpot && (
                      <p className="text-gray-900"><span className="font-semibold">Parking:</span> {order.parkingSpot}</p>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                  <h3 className="text-lg font-bold text-yellow-700 mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-700">{item.quantity}x {item.menuItemName}</span>
                        <span className="font-semibold text-gray-900">${item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="pt-6 space-y-3">
              <Link href="/" className="block">
                <Button className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 font-bold shadow-lg">
                  Return to Home
                </Button>
              </Link>
              <p className="text-center text-sm text-gray-600 font-medium italic">
                We'll notify you when your order is ready for pickup
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
