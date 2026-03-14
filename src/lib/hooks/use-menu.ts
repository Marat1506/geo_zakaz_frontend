'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/endpoints/menu';
import { MenuItem } from '@/types/menu';

export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: () => menuApi.getMenu(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMenuItem(id: string) {
  return useQuery({
    queryKey: ['menuItem', id],
    queryFn: () => menuApi.getMenuItem(id),
    enabled: !!id,
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (item: Omit<MenuItem, 'id'>) => menuApi.createMenuItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, item }: { id: string; item: Partial<MenuItem> }) =>
      menuApi.updateMenuItem(id, item),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['menuItem', variables.id] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuApi.deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => menuApi.uploadImage(file),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menuApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: { name: string; order?: number }) =>
      menuApi.createCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, category }: { id: string; category: { name?: string; order?: number } }) =>
      menuApi.updateCategory(id, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => menuApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
