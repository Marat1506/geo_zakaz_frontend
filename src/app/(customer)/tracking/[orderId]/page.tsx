'use client';

import { useEffect, useRef } from 'react';
import { useOrder } from '@/lib/hooks/use-orders';
import { usePushSubscription } from '@/lib/hooks/use-push-subscription';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Package, Truck, MapPin, Loader2, XCircle, ArrowLeft, RefreshCw, Bell, BellOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/toast';

const statusConfig: Record<string, { label: string; icon: any; color: string; ring: string }> = {
  pending_payment: { label: 'Awaiting payment', icon: Clock, color: 'bg-yellow-400', ring: 'ring-yellow-300' },
  preparing: { label: 'Preparing', icon: Package, color: 'bg-orange-500', ring: 'ring-orange-300' },
  on_the_way: { label: 'On the way', icon: Truck, color: 'bg-blue-500', ring: 'ring-blue-300' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-500', ring: 'ring-green-300' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-500', ring: 'ring-red-300' },
};

const statusOrder = ['pending_payment', 'preparing', 'on_the_way', 'delivered'];

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660; // Different pitch for customer
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.6);
  } catch { }
}

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const { data: order, isLoading, error, refetch, isFetching } = useOrder(params.orderId);
  const { pushEnabled, loading: pushLoading, toggle: togglePush } = usePushSubscription();
  const socketRef = useRef<any>(null);

  // WebSocket connection for real-time status updates
  useEffect(() => {
    if (!params.orderId) return;

    let socket: any;
    import('socket.io-client').then(({ io }) => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      socket = io(`${backendUrl}/notifications`, { transports: ['websocket'] });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('join_order_room', { orderId: params.orderId });
      });

      socket.on('order_status_changed', (data: { status: string }) => {
        playBeep();
        const label = statusConfig[data.status]?.label || data.status;
        toast({ title: '📦 Order update!', description: `Your order status changed to: ${label}` });
        refetch();
      });
    }).catch(() => { });

    return () => {
      socket?.disconnect();
    };
  }, [params.orderId, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4">
        <Card className="max-w-md w-full text-center shadow-xl border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-red-600">Order not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">We could not find this order.</p>
            <Link href="/profile">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 min-h-[48px]">
                Go to profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.preparing;
  const StatusIcon = statusInfo.icon;
  const currentStatusIndex = statusOrder.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-6 px-4">
      <div className="container mx-auto max-w-2xl space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" className="text-orange-600 hover:bg-orange-100 pl-0">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePush}
              disabled={pushLoading}
              className="text-gray-500 hover:text-orange-600 gap-1.5"
            >
              {pushEnabled ? <Bell className="h-4 w-4 text-blue-500" /> : <BellOff className="h-4 w-4" />}
              {pushEnabled ? 'Push On' : 'Push Off'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="text-gray-500 hover:text-orange-600"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main order status card */}
        <Card className="shadow-xl border-2 border-orange-200 overflow-hidden">
          <div className={`${statusInfo.color} p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <StatusIcon className="h-9 w-9 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Order status</p>
                <p className="text-2xl font-bold">{statusInfo.label}</p>
                <p className="text-white/80 text-sm mt-1">#{order.orderNumber}</p>
              </div>
            </div>
            {order.estimatedTime && !isCancelled && order.status !== 'delivered' && (
              <div className="mt-4 bg-white/20 rounded-lg px-4 py-2 inline-block">
                <p className="text-sm font-semibold">⏱ Estimated time: ~{order.estimatedTime} min</p>
              </div>
            )}
          </div>
        </Card>

        {/* Progress */}
        {!isCancelled && (
          <Card className="shadow-lg border-2 border-orange-100">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                {statusOrder.map((status, index) => {
                  const cfg = statusConfig[status];
                  const Icon = cfg.icon;
                  const done = currentStatusIndex >= index;
                  const current = order.status === status;
                  return (
                    <div key={status} className="flex flex-col items-center flex-1">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all
                        ${done ? cfg.color : 'bg-gray-200'}
                        ${current ? `ring-4 ring-offset-2 ${cfg.ring}` : ''}`}
                      >
                        <Icon className={`h-5 w-5 ${done ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <p className={`text-xs mt-1 text-center leading-tight ${done ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                        {cfg.label}
                      </p>
                      {index < statusOrder.length - 1 && (
                        <div className="hidden" />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="relative mt-2 mx-5">
                <div className="h-1 bg-gray-200 rounded-full" />
                <div
                  className="h-1 bg-orange-400 rounded-full absolute top-0 left-0 transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statusOrder.length - 1)) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Car information */}
        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-orange-400" />
              Car information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-gray-700"><span className="text-gray-500">Plate:</span> <span className="font-semibold">{order.carPlateNumber}</span></p>
            <p className="text-gray-700"><span className="text-gray-500">Color:</span> <span className="font-semibold">{order.carColor}</span></p>
            {order.parkingSpot && (
              <p className="text-gray-700"><span className="text-gray-500">Parking:</span> <span className="font-semibold">{order.parkingSpot}</span></p>
            )}
          </CardContent>
        </Card>

        {/* Order items */}
        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-700">Order items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                  {item.menuItem?.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.menuItem.imageUrl}
                      alt={item.menuItemName}
                      className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{item.menuItemName}</p>
                    <p className="text-sm text-gray-500">{item.quantity} × {Number(item.price).toFixed(0)} ₽</p>
                  </div>
                  <p className="font-bold text-gray-800">{Number(item.subtotal).toFixed(0)} ₽</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-orange-600">{Number(order.totalAmount).toFixed(0)} ₽</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pb-4">
          <Link href="/profile" className="flex-1">
            <Button variant="outline" className="w-full min-h-[48px] border-orange-300 text-orange-600">
              My orders
            </Button>
          </Link>
          <Link href="/menu" className="flex-1">
            <Button className="w-full min-h-[48px] bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              Order more
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
