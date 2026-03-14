'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api/endpoints/orders';
import { useCartStore } from '@/lib/store/cart-store';
import { OrderStatus } from '@/types/order';
import { Location } from '@/types/geo';

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: (data: {
      deliveryAddress: string;
      deliveryLocation: Location;
    }) => {
      const cart = useCartStore.getState();
      return ordersApi.createOrder({ cart, ...data });
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getMyOrders(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000, // Автообновление каждые 30 сек
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useAllOrders() {
  return useQuery({
    queryKey: ['allOrders'],
    queryFn: () => ordersApi.getAllOrders(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}
