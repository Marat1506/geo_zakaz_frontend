'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Reviews } from '@/components/reviews/reviews';
import { Clock, ShoppingCart, Star, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useCartStore } from '@/lib/store/cart-store';
import { getImageUrl } from '@/lib/utils/image';
import { MenuItem } from '@/types/menu';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/toast';
import { AxiosError } from 'axios';
import { Header } from '@/components/layout/header';

export default function MenuItemPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const itemId = params.itemId as string;
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizeItem = (rawItem: MenuItem): MenuItem => ({
    ...rawItem,
    price: Number(rawItem.price),
    preparationTime: Number(rawItem.preparationTime),
    averageRating:
      rawItem.averageRating !== undefined && rawItem.averageRating !== null
        ? Number(rawItem.averageRating)
        : undefined,
    reviewCount:
      rawItem.reviewCount !== undefined && rawItem.reviewCount !== null
        ? Number(rawItem.reviewCount)
        : undefined,
  });

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const response = await apiClient.get<MenuItem>(`/menu/items/${itemId}`);
      setItem(normalizeItem(response.data));
    } catch (error) {
      const err = error as AxiosError;

      // Fallback for environments where single-item public endpoint is unavailable.
      if (err.response?.status === 404) {
        try {
          const menuResponse = await apiClient.get<{ readyNow: MenuItem[]; regular: MenuItem[] }>('/menu');
          const allItems = [...(menuResponse.data.readyNow || []), ...(menuResponse.data.regular || [])];
          const fallbackItem = allItems.find((menuItem) => menuItem.id === itemId) || null;
          setItem(fallbackItem ? normalizeItem(fallbackItem) : null);
          if (fallbackItem) return;
        } catch (fallbackError) {
          console.error('Fallback item load failed:', fallbackError);
        }
      }

      console.error('Failed to load item:', error);
      toast({ title: 'Error', description: 'Failed to load item', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname || `/menu/${itemId}`)}`);
      return;
    }

    if (!item) return;

    addItem(item, 1);

    toast({ title: 'Added to cart!' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">Item not found</p>
            <Button onClick={() => router.push('/')}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const itemImageUrl = getImageUrl(item.imageUrl);
  const backgroundImageUrl = getImageUrl(item.backgroundImageUrl) || itemImageUrl;
  const price = Number.isFinite(item.price) ? item.price : 0;
  const prepTime = Number.isFinite(item.preparationTime) ? item.preparationTime : 0;
  const rating = item.averageRating !== undefined ? Number(item.averageRating) : null;
  const reviewsCount = item.reviewCount !== undefined ? Number(item.reviewCount) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Item Details */}
        <Card className="mb-8 overflow-hidden border-orange-200 shadow-2xl">
          <div className="relative">
            {backgroundImageUrl ? (
              <div className="absolute inset-0">
                <img
                  src={backgroundImageUrl}
                  alt={`${item.name} background`}
                  className="w-full h-full object-cover scale-105 blur-sm opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/80 via-amber-500/70 to-yellow-400/70" />
              </div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-yellow-400" />
            )}

            <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
              {itemImageUrl ? (
                <img
                  src={itemImageUrl}
                  alt={item.name}
                  className="h-48 w-full md:w-64 rounded-2xl object-cover border-4 border-white/70 shadow-xl"
                />
              ) : (
                <div className="h-48 w-full md:w-64 rounded-2xl border-4 border-white/70 bg-white/20 backdrop-blur flex items-center justify-center text-white text-lg font-bold">
                  No Image
                </div>
              )}

              <div className="flex-1 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold mb-3">
                  <Sparkles className="h-4 w-4" />
                  Hot offer
                </div>
                <h1 className="text-3xl md:text-4xl font-black drop-shadow mb-3">{item.name}</h1>
                {rating && reviewsCount > 0 ? (
                  <div className="flex items-center gap-2 text-sm md:text-base mb-3">
                    <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                    <span className="font-bold">{rating.toFixed(1)}</span>
                    <span className="text-orange-100">({reviewsCount} reviews)</span>
                  </div>
                ) : null}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                  <Clock className="h-4 w-4" />
                  {prepTime} min
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-6 md:p-8 bg-gradient-to-b from-white to-orange-50/30">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-6">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {item.description || 'No description yet.'}
                </p>
              </div>
              <div className="md:text-right bg-orange-100/70 border border-orange-200 rounded-xl p-4 min-w-[180px]">
                <div className="text-xs font-bold uppercase text-orange-600 tracking-wide">
                  Price
                </div>
                <div className="text-3xl font-black text-orange-600 mb-2">
                  ${price.toFixed(2)}
                </div>
                {!item.available && (
                  <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                    Sold Out
                  </span>
                )}
              </div>
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={!item.available}
              size="lg"
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-200"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {item.available ? 'Add to Cart' : 'Sold Out'}
            </Button>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Reviews menuItemId={itemId} />
      </div>
    </div>
  );
}
