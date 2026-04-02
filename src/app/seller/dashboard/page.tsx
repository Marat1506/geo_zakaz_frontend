'use client';

import { useEffect, useRef, useState } from 'react';
import { useSellerOrders, useSellerUpdateOrderStatus, useSellerZones } from '@/lib/hooks/use-seller';
import { usePushSubscription } from '@/lib/hooks/use-push-subscription';
import { useAuthStore } from '@/lib/store/auth-store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RefreshCw, Bell, BellOff, ChevronDown, ChevronUp, Clock, Car, Package, Filter } from 'lucide-react';
import { toast } from '@/components/ui/toast';

type OrderStatus = 'pending_payment' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

const statusConfig: Record<OrderStatus, { label: string; color: string; next?: OrderStatus; nextLabel?: string; nextColor?: string }> = {
  pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', next: 'preparing', nextLabel: '→ Start Preparing', nextColor: 'bg-orange-500 hover:bg-orange-600' },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', next: 'on_the_way', nextLabel: '→ Out for Delivery', nextColor: 'bg-blue-500 hover:bg-blue-600' },
  on_the_way: { label: 'On the Way', color: 'bg-blue-100 text-blue-800', next: 'delivered', nextLabel: '→ Mark Delivered', nextColor: 'bg-green-500 hover:bg-green-600' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch { }
}

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<string>('active');
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const { pushEnabled, loading: pushLoading, toggle: togglePush } = usePushSubscription();
  const socketRef = useRef<any>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());

  const { data: zones = [] } = useSellerZones();
  const { data: orders = [], isLoading, refetch, isFetching } = useSellerOrders(
    zoneFilter ? { zoneId: zoneFilter } : undefined
  );
  const updateStatus = useSellerUpdateOrderStatus();

  // WebSocket connection for real-time new order notifications
  useEffect(() => {
    if (!user?.id) return;

    let socket: any;
    import('socket.io-client').then(({ io }) => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      socket = io(`${backendUrl}/notifications`, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_seller_room', { sellerId: user.id });
      });

      socket.on('new_order', (order: any) => {
        playBeep();
        toast({ title: '🔔 New Order!', description: `Order #${order.orderNumber} received.` });
        refetch();
      });
    }).catch(() => { });

    return () => {
      socket?.disconnect();
    };
  }, [user?.id, refetch]);

  // Detect new orders via polling fallback
  useEffect(() => {
    if (!orders.length) return;
    const currentIds = new Set(orders.map((o: any) => o.id));
    if (prevOrderIdsRef.current.size > 0) {
      for (const id of currentIds) {
        if (!prevOrderIdsRef.current.has(id)) {
          playBeep();
          break;
        }
      }
    }
    prevOrderIdsRef.current = currentIds;
  }, [orders]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    if (filter === 'active') return o.status !== 'delivered' && o.status !== 'cancelled';
    if (filter === 'all') return true;
    return o.status === filter;
  }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{orders.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={togglePush} disabled={pushLoading} className="gap-1.5 min-h-[40px]">
            {pushEnabled ? <Bell className="h-4 w-4 text-blue-500" /> : <BellOff className="h-4 w-4" />}
            {pushLoading ? '...' : (pushEnabled ? 'Push On' : 'Enable Push')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-1.5 min-h-[40px]">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'active', label: `Active (${orders.filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length})` },
            { value: 'all', label: 'All' },
            ...Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label })),
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px] ${filter === value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        {zones.length > 0 && (
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="text-sm font-medium bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              <option value="">All Zones</option>
              {zones.map((z: any) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No orders found</Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order: any) => {
            const s = statusConfig[order.status as OrderStatus];
            const isExpanded = expandedId === order.id;
            const isUpdating = updating === order.id;

            return (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                        <Badge className={`${s?.color} text-xs`}>{s?.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(order.createdAt).toLocaleString('ru-RU')}</span>
                        <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{order.carPlateNumber}</span>
                        <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{order.items?.length} items</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-bold text-lg">${Number(order.totalAmount).toFixed(2)}</span>
                      {s?.next && (
                        <Button size="sm" className={`text-white min-h-[40px] text-xs ${s.nextColor}`}
                          onClick={() => handleStatusUpdate(order.id, s.next!)} disabled={isUpdating}>
                          {isUpdating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : s.nextLabel}
                        </Button>
                      )}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Button size="sm" variant="outline" className="border-red-300 text-red-500 hover:bg-red-50 min-h-[40px] text-xs"
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')} disabled={isUpdating}>
                          Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="min-h-[40px] min-w-[40px] p-0"
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4 space-y-3">
                    <div className="space-y-2">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2 border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.menuItemName}</p>
                            <p className="text-xs text-gray-500">{item.quantity} × ${Number(item.price).toFixed(2)}</p>
                          </div>
                          <p className="font-semibold text-sm">${Number(item.subtotal).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    {order.carPhotoUrl && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Car photo:</p>
                        <img
                          src={order.carPhotoUrl.startsWith('http') ? order.carPhotoUrl : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${order.carPhotoUrl}`}
                          alt="Car" className="h-28 rounded-lg object-cover border"
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
