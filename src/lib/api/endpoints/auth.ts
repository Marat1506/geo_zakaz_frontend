import { apiClient } from '../client';
import {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  OptionalAuthTokens,
  User,
} from '@/types/auth';

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

  register: async (userData: RegisterData & {
    passportMain?: File;
    passportRegistration?: File;
    selfie?: File;
  }): Promise<{ user: User; tokens: OptionalAuthTokens }> => {
    const { confirmPassword: _, passportMain, passportRegistration, selfie, ...payload } = userData as any;

    // Always use FormData to support file uploads
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    if (passportMain) formData.append('passportMain', passportMain);
    if (passportRegistration) formData.append('passportRegistration', passportRegistration);
    if (selfie) formData.append('selfie', selfie);

    const { data } = await apiClient.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    await apiClient.post('/auth/logout');
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
