'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/endpoints/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { LoginCredentials, RegisterData } from '@/types/auth';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      console.log('Login success, user data:', data.user);
      console.log('User role:', data.user.role);
      setAuth(data.user, data.tokens);

      let redirectPath = '/menu';
      if (data.user.role === 'admin' || data.user.role === 'superadmin') {
        redirectPath = '/admin/dashboard';
      } else if (data.user.role === 'seller') {
        redirectPath = '/seller/dashboard';
      }

      console.log('Redirecting to:', redirectPath);
      // Используем window.location чтобы браузер отправил куки в middleware
      window.location.href = redirectPath;
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (userData: RegisterData) => authApi.register(userData),
    onSuccess: (data) => {
      // If tokens are empty, it means account is pending approval (Seller)
      if (!data.tokens.accessToken) {
        // Just stay on the page or redirect to a "waiting" page
        // The component will handle showing the success message
        return;
      }
      setAuth(data.user, data.tokens);
      window.location.href = '/menu';
    },
  });
}

export function useLogout() {
  const { clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateProfile() {
  const { updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<import('@/types/auth').User>) => authApi.updateProfile(userData),
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
}
