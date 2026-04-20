'use client';

import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/utils/image';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';

export default function CartPage() {
  const { items, subtotal, tax, deliveryFee, total, updateQuantity, updateInstructions, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-16 w-16 text-gray-400" />
            </div>
            <CardTitle className="text-2xl">Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-6">
              Add some delicious items from our menu to get started!
            </p>
            <Link href="/menu">
              <Button className="w-full">
                Browse Menu
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.menuItem.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Item Image */}
                    {item.menuItem.imageUrl && (
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(item.menuItem.imageUrl) || '/placeholder.png'}
                          alt={item.menuItem.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{item.menuItem.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            ${item.menuItem.price.toFixed(2)} each
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.menuItem.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <span className="ml-auto font-semibold">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Special Instructions */}
                      <div>
                        <Input
                          placeholder="Special instructions (optional)"
                          value={item.specialInstructions || ''}
                          onChange={(e) => updateInstructions(item.menuItem.id, e.target.value)}
                          aria-label="Special instructions"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  {!user && <Lock className="mr-2 h-5 w-5" />}
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
