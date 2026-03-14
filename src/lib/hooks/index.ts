// Authentication hooks
export {
  useLogin,
  useRegister,
  useLogout,
  useCurrentUser,
} from './use-auth';

// Geolocation hooks
export {
  useCheckLocation,
  useServiceZones,
  useCreateServiceZone,
  useUpdateServiceZone,
  useDeleteServiceZone,
} from './use-geo';

// Menu hooks
export {
  useMenu,
  useMenuItem,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useUploadImage,
} from './use-menu';

// Order hooks
export {
  useCreateOrder,
  useOrders,
  useOrder,
  useUpdateOrderStatus,
  useAllOrders,
} from './use-orders';

// Auth guard hook
export { useAuthGuard } from './use-auth-guard';
