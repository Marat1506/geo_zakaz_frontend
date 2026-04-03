import { MenuItem } from "./menu";

export type OrderStatus =
  | "pending_payment"
  | "preparing"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "online" | "cash";

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  carPlateNumber: string;
  carColor: string;
  parkingSpot?: string;
  carPhotoUrl: string;
  estimatedTime: number;
  zoneId: string;
  sellerId?: string;
  zone?: {
    id: string;
    name: string;
  };
  seller?: {
    id: string;
    name?: string;
    email: string;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
}
