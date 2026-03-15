'use client';

import { useState } from 'react';
import { useAllOrders, useUpdateOrderStatus } from '@/lib/hooks/use-orders';
import { useMenu } from '@/lib/hooks/use-menu';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderStatus } from '@/types/order';
import { DollarSign, ShoppingBag, UtensilsCrossed, TrendingUp, RefreshCw, ChevronDown, ChevronUp, Car, Clock, Package } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus; nextLabel?: string; nextColor?: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', next: 'preparing',  nextLabel: '→ Start Preparing', nextColor: 'bg-orange-500 hover:bg-orange-600' },
  preparing:       { label: 'Preparing',       color: 'bg-orange-100 text-orange-800', next: 'on_the_way', nextLabel: '→ Out for Delivery', nextColor: 'bg-blue-500 hover:bg-blue-600' },
  on_the_way:      { label: 'On the Way',       color: 'bg-blue-100 text-blue-800',    next: 'delivered',  nextLabel: '→ Mark Delivered',   nextColor: 'bg-green-500 hover:bg-green-600' },
  delivered:       { label: 'Delivered',        color: 'bg-green-100 text-green-800' },
  cancelled:       { label: 'Cancelled',        color: 'bg-red-100 text-red-800' },
};

const ALL_STATUSES: OrderStatus[] = ['pending_payment', 'preparing', 'on_the_way', 'delivered', 'cancelled'];

export default function DashboardPage() {
  const { data: orders, isLoading: ordersLoading, refetch, isFetching } = useAllOrders();
  const { data: menuData, isLoading: menuLoading } = useMenu();
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

  if (ordersLoading || menuLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" /></div>;
  }

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.totalAmount), 0) || 0;
  const activeOrders = orders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0;
  const totalMenuItems = menuData?.reduce((sum, cat) => sum + cat.items.length, 0) || 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todaysOrders = orders?.filter(o => { const d = new Date(o.createdAt); d.setHours(0,0,0,0); return d.getTime() === today.getTime(); }).length || 0;

  const filteredOrders = (orders || []).filter(o => {
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'all') return true;
    return o.status === filter;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="w-full sm:w-auto justify-center gap-2 min-h-[44px]">
          <RefreshCw className={`h-4 w-4 shrink-0 ${isFetching ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Stats - single column on mobile, grid on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Total Revenue',  value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign,     color: 'bg-green-100 text-green-600' },
          { label: 'Active Orders',  value: activeOrders,                  icon: ShoppingBag,    color: 'bg-blue-100 text-blue-600' },
          { label: 'Menu Items',     value: totalMenuItems,                icon: UtensilsCrossed, color: 'bg-purple-100 text-purple-600' },
          { label: "Today's Orders", value: todaysOrders,                  icon: TrendingUp,     color: 'bg-orange-100 text-orange-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-4 sm:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
              </div>
              <div className={`h-10 w-10 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Orders */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-900">Orders</h2>
          <span className="text-sm text-gray-500">{orders?.length || 0} total</span>
        </div>

        {/* Filters - scroll on mobile */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { value: 'active', label: `Active (${activeOrders})` },
            { value: 'all',    label: 'All' },
            ...ALL_STATUSES.map(s => ({ value: s, label: statusConfig[s].label })),
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[40px] inline-flex items-center justify-center ${
                filter === value ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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
                  <div className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                            <Badge className={`${s.color} text-xs`}>{s.label}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 shrink-0" />{new Date(order.createdAt).toLocaleString()}</span>
                            <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5 shrink-0" />{order.carPlateNumber} · {order.carColor}</span>
                            {order.parkingSpot && <span>Parking: {order.parkingSpot}</span>}
                            <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5 shrink-0" />{order.items.length} items</span>
                          </div>
                        </div>
                        <span className="font-bold text-lg text-gray-900 shrink-0">${Number(order.totalAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {s.next && (
                          <Button size="sm" className={`text-white min-h-[40px] text-xs inline-flex items-center justify-center gap-1.5 ${s.nextColor}`} onClick={() => handleStatusUpdate(order.id, s.next!)} disabled={isUpdating}>
                            {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" /> : <span>{s.nextLabel}</span>}
                          </Button>
                        )}
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <Button size="sm" variant="outline" className="border-red-300 text-red-500 hover:bg-red-50 min-h-[40px] text-xs inline-flex items-center justify-center" onClick={() => handleStatusUpdate(order.id, 'cancelled')} disabled={isUpdating}>
                            Cancel
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="min-h-[40px] min-w-[40px] p-0 inline-flex items-center justify-center" onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4 space-y-4">
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
                                <p className="text-xs text-gray-500">{item.quantity} × ${Number(item.price).toFixed(2)}</p>
                              </div>
                              <p className="font-semibold text-sm">${Number(item.subtotal).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Change status:</p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_STATUSES.map((status) => {
                            const cfg = statusConfig[status];
                            return (
                              <button
                                key={status}
                                type="button"
                                onClick={() => handleStatusUpdate(order.id, status)}
                                disabled={order.status === status || isUpdating}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[36px] border-2 inline-flex items-center justify-center ${
                                  order.status === status
                                    ? `${cfg.color} border-current cursor-default`
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 disabled:opacity-50'
                                }`}
                              >
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {order.carPhotoUrl && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-2">Car photo:</p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={order.carPhotoUrl} alt="Car" className="h-32 rounded-lg object-cover border" />
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
    </div>
  );
}
