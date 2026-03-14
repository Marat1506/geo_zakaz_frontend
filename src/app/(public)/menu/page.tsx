'use client';

import { useState } from 'react';
import { useMenu } from '@/lib/hooks/use-menu';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Clock, Lock, User, LogIn } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils/image';

export default function MenuPage() {
  const { data: categories, isLoading, error } = useMenu();
  const { addItem, items } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load menu</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const allCategories = ['all', ...(categories?.map(cat => cat.name) || [])];
  const filteredItems = selectedCategory === 'all'
    ? categories?.flatMap(cat => cat.items) || []
    : categories?.find(cat => cat.name === selectedCategory)?.items || [];

  const handleAddToCart = (item: MenuItem) => {
    if (!user) {
      router.push('/login?redirect=/menu');
      return;
    }
    addItem(item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50">
      <header className="bg-gradient-to-r from-orange-500 to-yellow-500 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">🍔 Меню</h1>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/profile">
                <Button variant="outline" className="min-h-[48px] min-w-[48px] bg-white hover:bg-yellow-50 border-2 border-white px-3 gap-2" aria-label="Личный кабинет">
                  <User className="h-5 w-5 text-orange-600" />
                  <span className="hidden sm:inline text-orange-600 font-semibold text-sm">{user.name || 'Кабинет'}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="min-h-[48px] bg-white hover:bg-yellow-50 border-2 border-white px-3 gap-2" aria-label="Войти">
                  <LogIn className="h-5 w-5 text-orange-600" />
                  <span className="hidden sm:inline text-orange-600 font-semibold text-sm">Войти</span>
                </Button>
              </Link>
            )}
            <Link href="/cart">
              <Button variant="outline" className="relative min-h-[48px] min-w-[48px] bg-white hover:bg-yellow-50 border-2 border-white" aria-label={`Корзина: ${cartItemCount} товаров`}>
                <ShoppingCart className="h-6 w-6 text-orange-600" aria-hidden="true" />
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-red-500 text-white font-bold text-xs"
                    aria-label={`${cartItemCount} товаров в корзине`}
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 px-4" role="tablist" aria-label="Menu categories">
          {allCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap min-h-[48px] px-6 text-lg font-semibold shadow-md ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white' 
                  : 'bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50'
              }`}
              role="tab"
              aria-selected={selectedCategory === category}
              aria-controls={`${category}-panel`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="tabpanel"
          id={`${selectedCategory}-panel`}
          aria-labelledby={`${selectedCategory}-tab`}
        >
          {filteredItems.map((item: MenuItem) => (
            <Card key={item.id} className="overflow-hidden flex flex-col">
              {item.imageUrl && (
                <div className="relative h-48 w-full bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <Badge 
                    variant={item.available ? 'default' : 'secondary'}
                    aria-label={item.available ? 'Available' : 'Unavailable'}
                  >
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {item.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span>{item.preparationTime} min</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-4">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${item.price.toFixed(2)}
                </span>
                <Button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.available}
                  className="min-h-[44px]"
                  aria-label={`Add ${item.name} to cart for ${item.price.toFixed(2)}`}
                >
                  {!user && <Lock className="h-4 w-4 mr-1" aria-hidden="true" />}
                  <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                  {user ? 'Add to Cart' : 'Login to Order'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No items found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
