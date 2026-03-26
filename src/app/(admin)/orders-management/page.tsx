'use client';

import { useState } from 'react';
import { useAllOrders, useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types/order';
import { ChevronDown, ChevronUp, RefreshCw, Car, Clock, Package } from 'lucide-react';

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
  const updateStatus = useUpdateOrderStatus();
  const [filter, setFilter] = useState<string>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" /></div>;
  }

  const filteredOrders = (orders || []).filter(o => {
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'all') return true;
    return o.status === filter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 text-sm mt-1">Total: {orders?.length || 0} orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
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

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No orders found</Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const s = statusConfig[order.status];
            const isExpanded = expandedId === order.id;
            const isUpdating = updating === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                {/* Order header */}
                <div className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(order.createdAt).toLocaleString('ru-RU')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Car className="h-3.5 w-3.5" />
                          {order.carPlateNumber} · {order.carColor}
                        </span>
                        {order.parkingSpot && <span>Parking: {order.parkingSpot}</span>}
                        <span className="flex items-center gap-1">
                          <Package className="h-3.5 w-3.5" />
                          {order.items.length} items
                        </span>
                      </div>
                    </div>

                    {/* Total and actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-lg text-gray-900">{Number(order.totalAmount).toFixed(0)} ₽</span>

                      {/* Next status button */}
                      {s.next && (
                        <Button
                          size="sm"
                        className={`text-white min-h-[40px] text-xs ${s.nextColor}`}
                          onClick={() => handleStatusUpdate(order.id, s.next!)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : s.nextLabel}
                        </Button>
                      )}

                      {/* Cancel (if not final status) */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-500 hover:bg-red-50 min-h-[40px] text-xs"
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      )}

                      {/* Expand */}
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

                {/* Order details */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
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

                    {/* Manual status change */}
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Change status:</p>
                      <div className="flex flex-wrap gap-2">
                        {ALL_STATUSES.map((status) => {
                          const cfg = statusConfig[status];
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusUpdate(order.id, status)}
                              disabled={order.status === status || isUpdating}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[36px] border-2 ${
                                order.status === status
                                  ? `${cfg.color} border-current opacity-100 cursor-default`
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50'
                              }`}
                            >
                              {cfg.label}
                            </button>
                          );
                        })}
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
