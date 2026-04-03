'use client';

import { useState } from 'react';
import { useAllOrders } from '@/lib/hooks/use-orders';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types/order';
import { ChevronDown, ChevronUp, RefreshCw, Car, Clock, Package, Store, MapPin } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus; nextLabel?: string; nextColor?: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', next: 'preparing',  nextLabel: '→ Start Preparing', nextColor: 'bg-orange-500 hover:bg-orange-600' },
  preparing:       { label: 'Preparing',       color: 'bg-orange-100 text-orange-800', next: 'on_the_way', nextLabel: '→ Out for Delivery', nextColor: 'bg-blue-500 hover:bg-blue-600' },
  on_the_way:      { label: 'On the Way',       color: 'bg-blue-100 text-blue-800',    next: 'delivered',  nextLabel: '→ Mark Delivered',  nextColor: 'bg-green-500 hover:bg-green-600' },
  delivered:       { label: 'Delivered',        color: 'bg-green-100 text-green-800' },
  cancelled:       { label: 'Cancelled',        color: 'bg-red-100 text-red-800' },
};

const ALL_STATUSES: OrderStatus[] = ['pending_payment', 'preparing', 'on_the_way', 'delivered', 'cancelled'];

export default function OrdersManagementPage() {
  const { data: orders, isLoading, refetch, isFetching } = useAllOrders();
  const [filter, setFilter] = useState<string>('active');
  const [sellerFilter, setSellerFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" /></div>;
  }

  // Collect unique sellers from orders
  const sellers = Array.from(
    new Map(
      (orders || [])
        .filter(o => o.seller || o.sellerId)
        .map(o => [o.sellerId, { id: o.sellerId!, name: o.seller?.name || o.seller?.email || o.sellerId }])
    ).values()
  );

  const filteredOrders = (orders || []).filter(o => {
    const statusMatch = filter === 'active'
      ? o.status !== 'delivered' && o.status !== 'cancelled'
      : filter === 'all' ? true : o.status === filter;
    const sellerMatch = sellerFilter ? o.sellerId === sellerFilter : true;
    return statusMatch && sellerMatch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 text-sm mt-1">Total: {orders?.length || 0} orders · Read-only overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'active', label: `Active (${(orders || []).filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length})` },
          { value: 'all', label: 'All' },
          ...ALL_STATUSES.map(s => ({ value: s, label: statusConfig[s].label })),
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${
              filter === value ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Seller filter */}
      {sellers.length > 0 && (
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-gray-400" />
          <select
            value={sellerFilter}
            onChange={e => setSellerFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          >
            <option value="">All Sellers</option>
            {sellers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No orders found</Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const s = statusConfig[order.status];
            const isExpanded = expandedId === order.id;
            const isUpdating = updating === order.id;
            const sellerName = order.seller?.name || order.seller?.email || (order.sellerId ? `Seller ${order.sellerId.slice(0, 8)}` : 'Unknown');
            const zoneName = order.zone?.name || '—';

            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
                        {/* Seller badge */}
                        <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          <Store className="h-3 w-3" />
                          {sellerName}
                        </span>
                        {/* Zone badge */}
                        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          <MapPin className="h-3 w-3" />
                          {zoneName}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" />
                          {order.carPlateNumber}
                        </span>
                        {order.parkingSpot && <span>Parking: {order.parkingSpot}</span>}
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          {order.items.length} items
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-lg text-gray-900">{Number(order.totalAmount).toFixed(0)} ₽</span>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="min-h-[40px] min-w-[40px] p-0"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    {/* Seller & Zone info */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Seller</p>
                        <p className="font-semibold text-gray-800">{sellerName}</p>
                        {order.seller?.email && order.seller.name && (
                          <p className="text-xs text-gray-500">{order.seller.email}</p>
                        )}
                      </div>
                      <div className="bg-white rounded-lg p-3 border">
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Zone</p>
                        <p className="font-semibold text-gray-800">{zoneName}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Order items:</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2 border">
                            {item.menuItem?.imageUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.menuItem.imageUrl} alt={item.menuItemName} className="h-10 w-10 rounded object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{item.menuItemName}</p>
                              <p className="text-xs text-gray-500">{item.quantity} × {Number(item.price).toFixed(0)} ₽</p>
                            </div>
                            <p className="font-semibold text-sm">{Number(item.subtotal).toFixed(0)} ₽</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Car photo */}
                    {order.carPhotoUrl && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Car photo:</p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={order.carPhotoUrl.startsWith('http') ? order.carPhotoUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${order.carPhotoUrl}`}
                          alt="Car"
                          className="h-32 rounded-lg object-cover border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
