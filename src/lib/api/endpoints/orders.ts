import { apiClient } from '../client';
import { Order, OrderStatus } from '@/types/order';

export interface CreateOrderRequest {
  items: Array<{ menuItemId: string; quantity: number }>;
  carPlateNumber: string;
  parkingSpot?: string;
  customerLat: number;
  customerLng: number;
  paymentMethod: 'cash' | 'online';
  carPhoto: File;
}

export const ordersApi = {
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const formData = new FormData();
    formData.append('items', JSON.stringify(orderData.items));
    formData.append('carPlateNumber', orderData.carPlateNumber);
    if (orderData.parkingSpot) {
      formData.append('parkingSpot', orderData.parkingSpot);
    }
    formData.append('customerLat', String(orderData.customerLat));
    formData.append('customerLng', String(orderData.customerLng));
    formData.append('paymentMethod', orderData.paymentMethod);
    formData.append('carPhoto', orderData.carPhoto);

    const { data } = await apiClient.post('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
