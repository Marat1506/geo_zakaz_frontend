'use client';

import { useOrder } from '@/lib/hooks/use-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Package, Truck, MapPin, Loader2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; icon: any; color: string; ring: string }> = {
  pending_payment: { label: 'Ожидает оплаты', icon: Clock, color: 'bg-yellow-400', ring: 'ring-yellow-300' },
  preparing: { label: 'Готовится', icon: Package, color: 'bg-orange-500', ring: 'ring-orange-300' },
  on_the_way: { label: 'В пути', icon: Truck, color: 'bg-blue-500', ring: 'ring-blue-300' },
  delivered: { label: 'Доставлен', icon: CheckCircle, color: 'bg-green-500', ring: 'ring-green-300' },
  cancelled: { label: 'Отменён', icon: XCircle, color: 'bg-red-500', ring: 'ring-red-300' },
};

const statusOrder = ['pending_payment', 'preparing', 'on_the_way', 'delivered'];

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const { data: order, isLoading, error, refetch, isFetching } = useOrder(params.orderId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Загружаем заказ...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 px-4">
        <Card className="max-w-md w-full text-center shadow-xl border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="text-red-600">Заказ не найден</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">Не удалось найти этот заказ.</p>
            <Link href="/profile">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 min-h-[48px]">
                В личный кабинет
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

        {/* Шапка */}
        <div className="flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" className="text-orange-600 hover:bg-orange-100 pl-0">
              <ArrowLeft className="h-5 w-5 mr-1" />
              Назад
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-gray-500 hover:text-orange-600"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>

        {/* Статус заказа — главная карточка */}
        <Card className="shadow-xl border-2 border-orange-200 overflow-hidden">
          <div className={`${statusInfo.color} p-6 text-white`}>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <StatusIcon className="h-9 w-9 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm">Статус заказа</p>
                <p className="text-2xl font-bold">{statusInfo.label}</p>
                <p className="text-white/80 text-sm mt-1">#{order.orderNumber}</p>
              </div>
            </div>
            {order.estimatedTime && !isCancelled && order.status !== 'delivered' && (
              <div className="mt-4 bg-white/20 rounded-lg px-4 py-2 inline-block">
                <p className="text-sm font-semibold">⏱ Примерное время: ~{order.estimatedTime} мин</p>
              </div>
            )}
          </div>
        </Card>

        {/* Прогресс */}
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
              {/* Линия прогресса */}
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

        {/* Информация об авто */}
        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-gray-700">
              <MapPin className="h-5 w-5 text-orange-400" />
              Информация об автомобиле
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-gray-700"><span className="text-gray-500">Номер:</span> <span className="font-semibold">{order.carPlateNumber}</span></p>
            <p className="text-gray-700"><span className="text-gray-500">Цвет:</span> <span className="font-semibold">{order.carColor}</span></p>
            {order.parkingSpot && (
              <p className="text-gray-700"><span className="text-gray-500">Парковка:</span> <span className="font-semibold">{order.parkingSpot}</span></p>
            )}
          </CardContent>
        </Card>

        {/* Состав заказа */}
        <Card className="shadow-lg border-2 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-gray-700">Состав заказа</CardTitle>
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
              <span className="text-lg font-bold text-gray-800">Итого</span>
              <span className="text-xl font-bold text-orange-600">{Number(order.totalAmount).toFixed(0)} ₽</span>
            </div>
          </CardContent>
        </Card>

        {/* Кнопки */}
        <div className="flex gap-3 pb-4">
          <Link href="/profile" className="flex-1">
            <Button variant="outline" className="w-full min-h-[48px] border-orange-300 text-orange-600">
              Мои заказы
            </Button>
          </Link>
          <Link href="/menu" className="flex-1">
            <Button className="w-full min-h-[48px] bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              Заказать ещё
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
