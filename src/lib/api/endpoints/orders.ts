import { apiClient } from '../client';
import { Order, OrderStatus } from '@/types/order';
import { Cart } from '@/types/cart';
import { Location } from '@/types/geo';

export const ordersApi = {
  createOrder: async (orderData: {
    cart: Cart;
    deliveryAddress: string;
    deliveryLocation: Location;
  }): Promise<Order> => {
    const { data } = await apiClient.post('/orders', orderData);
    return data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get('/orders/customer/my-orders');
    return data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const { data } = await apiClient.patch(`/orders/admin/${id}/status`, { status });
    return data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const { data } = await apiClient.get('/orders/admin/list');
    return data;
  },
};
