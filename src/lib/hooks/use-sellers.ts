'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sellersApi, CreateSellerDto } from '@/lib/api/endpoints/sellers';

export function useSellers() {
  return useQuery({
    queryKey: ['sellers'],
    queryFn: () => sellersApi.getSellers(),
  });
}

export function useCreateSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSellerDto) => sellersApi.createSeller(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
}

export function useBlockSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellersApi.blockSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
}

export function useUnblockSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellersApi.unblockSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
}

export function useApproveSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellersApi.approveSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
}

export function useRejectSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sellersApi.rejectSeller(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });
}
