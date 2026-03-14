import { apiClient } from '../client';
import { MenuItem, MenuCategory } from '@/types/menu';

export const menuApi = {
  getMenu: async (): Promise<MenuCategory[]> => {
    const { data } = await apiClient.get<{ readyNow: MenuItem[]; regular: MenuItem[] }>('/menu');
    
    // Transform backend response to frontend format and convert price strings to numbers
    const transformItems = (items: any[]): MenuItem[] => {
      return items.map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      }));
    };
    
    const categories: MenuCategory[] = [];
    
    if (data.readyNow && data.readyNow.length > 0) {
      categories.push({
        id: 'ready-now',
        name: 'Ready Now',
        items: transformItems(data.readyNow),
      });
    }
    
    if (data.regular && data.regular.length > 0) {
      categories.push({
        id: 'regular',
        name: 'Regular Menu',
        items: transformItems(data.regular),
      });
    }
    
    return categories;
  },

  getMenuItem: async (id: string): Promise<MenuItem> => {
    const { data } = await apiClient.get(`/menu/admin/${id}`);
    return data;
  },

  createMenuItem: async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    const { data } = await apiClient.post('/menu/admin', item);
    return data;
  },

  updateMenuItem: async (id: string, item: Partial<MenuItem>): Promise<MenuItem> => {
    const { data } = await apiClient.patch(`/menu/admin/${id}`, item);
    return data;
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu/admin/${id}`);
  },

  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/menu/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Category endpoints
  getCategories: async (): Promise<Array<{ id: string; name: string; order: number }>> => {
    const { data } = await apiClient.get('/menu/categories');
    return data;
  },

  createCategory: async (category: { name: string; order?: number }): Promise<{ id: string; name: string; order: number }> => {
    const { data } = await apiClient.post('/menu/admin/categories', category);
    return data;
  },

  updateCategory: async (id: string, category: { name?: string; order?: number }): Promise<{ id: string; name: string; order: number }> => {
    const { data } = await apiClient.patch(`/menu/admin/categories/${id}`, category);
    return data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/menu/admin/categories/${id}`);
  },
};
