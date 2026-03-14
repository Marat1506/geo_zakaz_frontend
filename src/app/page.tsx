'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingBag, MapPin, Clock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-white px-4 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-4xl space-y-12 text-center">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white sm:text-7xl">
            Delicious Food
            <br />
            <span className="text-orange-500">Delivered Fast</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mx-auto max-w-2xl">
            Order your favorite meals and get them delivered right to your parking spot
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            onClick={() => router.push('/menu')}
            className="min-w-[250px] bg-orange-500 hover:bg-orange-600 text-lg py-6"
          >
            <ShoppingBag className="mr-2 h-6 w-6" />
            Browse Menu
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No registration required to browse
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
                <MapPin className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Geo-Fenced Delivery
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We verify your location during checkout to ensure fast delivery
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Service
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Some items are ready now for immediate pickup
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
                <ShoppingBag className="h-8 w-8 text-orange-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Easy Ordering
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Simple checkout process with real-time order tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
