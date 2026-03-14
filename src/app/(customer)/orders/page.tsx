'use client';

import { useOrders } from '@/lib/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';

const statusConfig = {
  pending_payment: { label: 'Pending Payment', icon: Clock, color: 'bg-yellow-500' },
  preparing: { label: 'Preparing', icon: Package, color: 'bg-orange-500' },
  on_the_way: { label: 'On the Way', icon: Truck, color: 'bg-purple-500' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500' },
};

export default function OrderHistoryPage() {
  const { data: orders, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn&apos;t load your orders. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Package className="h-6 w-6" />
              No Orders Yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven&apos;t placed any orders yet. Start by browsing our menu!
            </p>
            <Link href="/menu">
              <Button className="w-full">Browse Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = statusConfig[order.status];
          const StatusIcon = statusInfo.icon;

          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </h3>
                      <Badge className={`${statusInfo.color} text-white`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-xl font-bold">${Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                    <Link href={`/tracking/${order.id}`}>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Track Order
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
