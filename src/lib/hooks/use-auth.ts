'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/endpoints/auth';
import { useAuthStore } from '@/lib/store/auth-store';
import { LoginCredentials, RegisterData } from '@/types/auth';

export function useFaceLogin(redirectPath?: string) {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (payload: { descriptor: number[]; email?: string }) =>
      authApi.faceLogin(payload),
    onSuccess: (data) => {
      setAuth(data.user, data.tokens);

      const safeRedirect =
        redirectPath && redirectPath.startsWith('/') ? redirectPath : undefined;

      let targetPath = '/menu';
      if (safeRedirect) {
        targetPath = safeRedirect;
      } else if (data.user.role === 'admin' || data.user.role === 'superadmin') {
        targetPath = '/admin/dashboard';
      } else if (data.user.role === 'seller') {
        targetPath = '/seller/dashboard';
      }

      window.location.href = targetPath;
    },
    onError: (error) => {
      console.error('Face login error:', error);
    },
  });
}

export function useLogin(redirectPath?: string) {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      console.log('Login success, user data:', data.user);
      console.log('User role:', data.user.role);
      setAuth(data.user, data.tokens);

      const safeRedirect =
        redirectPath && redirectPath.startsWith('/') ? redirectPath : undefined;

      let targetPath = '/menu';
      if (safeRedirect) {
        // If user came from a deep link (e.g. /ref/:slug), return there for any role.
        targetPath = safeRedirect;
      } else if (data.user.role === 'admin' || data.user.role === 'superadmin') {
        targetPath = '/admin/dashboard';
      } else if (data.user.role === 'seller') {
        targetPath = '/seller/dashboard';
      }

      console.log('Redirecting to:', targetPath);
      // Use window.location so the browser sends cookies to middleware
      window.location.href = targetPath;
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (userData: RegisterData) => authApi.register(userData),
    onSuccess: (data) => {
      if (data.requiresEmailVerification) return;
      if (!data.tokens.accessToken || !data.tokens.refreshToken) return;
      setAuth(data.user, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      window.location.href = '/menu';
    },
  });
}

export function useVerifyRegistrationEmail() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyRegistrationEmail(email, code),
    onSuccess: (data) => {
      if (!data.tokens.accessToken || !data.tokens.refreshToken) {
        return;
      }
      setAuth(data.user, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      let targetPath = '/menu';
      if (data.user.role === 'admin' || data.user.role === 'superadmin') {
        targetPath = '/admin/dashboard';
      } else if (data.user.role === 'seller') {
        targetPath = '/seller/dashboard';
      }
      window.location.href = targetPath;
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
