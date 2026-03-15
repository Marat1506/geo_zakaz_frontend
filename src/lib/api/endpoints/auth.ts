import { apiClient } from '../client';
import { LoginCredentials, RegisterData, AuthTokens, User } from '@/types/auth';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    console.log('Sending login request with:', credentials);
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      console.log('Login response:', data);
      // Backend returns { accessToken, refreshToken, user }
      // Transform to { user, tokens: { accessToken, refreshToken } }
      return {
        user: data.user,
        tokens: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    // Strip confirmPassword — it's frontend-only validation, backend doesn't accept it
    const { confirmPassword: _, ...payload } = userData as any;
    const { data } = await apiClient.post('/auth/register', payload);
    // Backend returns { accessToken, refreshToken, user }
    // Transform to { user, tokens: { accessToken, refreshToken } }
    return {
      user: data.user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (): Promise<void> => {
    // No server-side logout endpoint — just clear local state
    return Promise.resolve();
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch('/auth/profile', userData);
    return data;
  },
};
