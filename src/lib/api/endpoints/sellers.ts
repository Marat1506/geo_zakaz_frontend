import { apiClient } from '../client';

export interface Seller {
  id: string;
  email: string;
  name: string | null;
  isBlocked: boolean;
  status: 'pending' | 'approved' | 'rejected';
  role: string;
}

export interface CreateSellerDto {
  email: string;
  name: string;
  password: string;
}

export const sellersApi = {
  getSellers: async (): Promise<Seller[]> => {
    const { data } = await apiClient.get<Seller[]>('/auth/sellers');
    return data;
  },

  createSeller: async (dto: CreateSellerDto): Promise<Seller> => {
    const { data } = await apiClient.post<Seller>('/auth/sellers', dto);
    return data;
  },

  blockSeller: async (id: string): Promise<Seller> => {
    const { data } = await apiClient.patch<Seller>(`/auth/sellers/${id}/block`);
    return data;
  },

  unblockSeller: async (id: string): Promise<Seller> => {
    const { data } = await apiClient.patch<Seller>(`/auth/sellers/${id}/unblock`);
    return data;
  },

  approveSeller: async (id: string): Promise<Seller> => {
    const { data } = await apiClient.patch<Seller>(`/auth/sellers/${id}/approve`);
    return data;
  },

  rejectSeller: async (id: string): Promise<Seller> => {
    const { data } = await apiClient.patch<Seller>(`/auth/sellers/${id}/reject`);
    return data;
  },
};
