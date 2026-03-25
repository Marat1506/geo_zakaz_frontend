import { apiClient } from '../client';
import { MenuItem, MenuCategory } from '@/types/menu';

export const menuApi = {
  getMenu: async (): Promise<MenuCategory[]> => {
    const { data } = await apiClient.get<{ readyNow: MenuItem[]; regular: MenuItem[] }>('/menu');
    
    const transformItem = (item: any): MenuItem => ({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
    });

    const allItems = [
      ...(data.readyNow || []).map(transformItem),
      ...(data.regular || []).map(transformItem),
    ];

    if (allItems.length === 0) return [];

    // Group by category
    const categoryMap = new Map<string, MenuItem[]>();
    for (const item of allItems) {
      const cat = item.category || 'Other';
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(item);
    }

    return Array.from(categoryMap.entries()).map(([name, items]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      items,
    }));
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
