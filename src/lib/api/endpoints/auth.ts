import { apiClient } from '../client';
import {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  OptionalAuthTokens,
  RegisterApiResponse,
  User,
} from '@/types/auth';

/** Raw NestJS auth JSON shapes */
interface LoginFaceAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterRawResponse {
  accessToken: string | null;
  refreshToken: string | null;
  user: User;
  requiresEmailVerification?: boolean;
}

interface RefreshRawResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    console.log('Sending login request with:', credentials);
    try {
      const { data } = await apiClient.post<LoginFaceAuthResponse>('/auth/login', credentials);
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
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData: RegisterData & {
    passportMain?: File;
    passportRegistration?: File;
    selfie?: File;
  }): Promise<RegisterApiResponse> => {
    const {
      confirmPassword: _,
      passportMain,
      passportRegistration,
      selfie,
      faceDescriptors,
      ...payload
    } = userData as any;

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formData.append('faceDescriptors', JSON.stringify(faceDescriptors ?? []));
    if (passportMain) formData.append('passportMain', passportMain);
    if (passportRegistration) formData.append('passportRegistration', passportRegistration);
    if (selfie) formData.append('selfie', selfie);

    // multipart/form-data boundary is set automatically by the browser for FormData.
    const { data } = await apiClient.post<RegisterRawResponse>('/auth/register', formData);
    return {
      user: data.user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
      requiresEmailVerification: !!data.requiresEmailVerification,
    };
  },

  verifyRegistrationEmail: async (
    email: string,
    code: string,
  ): Promise<{ user: User; tokens: OptionalAuthTokens }> => {
    const { data } = await apiClient.post<RegisterRawResponse>('/auth/register/verify', {
      email: email.trim().toLowerCase(),
      code: code.trim(),
    });
    return {
      user: data.user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  },

  resendRegistrationCode: async (email: string): Promise<void> => {
    await apiClient.post('/auth/register/resend-code', {
      email: email.trim().toLowerCase(),
    });
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post<RefreshRawResponse>('/auth/refresh', { refreshToken });
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.patch<User>('/auth/profile', userData);
    return data;
  },

  enrollFace: async (descriptors: number[][]): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean }>('/auth/face/enroll', { descriptors });
    return data;
  },

  faceLogin: async (payload: {
    descriptor: number[];
    email?: string;
  }): Promise<{ user: User; tokens: AuthTokens }> => {
    const body: { descriptor: number[]; email?: string } = {
      descriptor: payload.descriptor,
    };
    if (payload.email?.trim()) {
      body.email = payload.email.trim().toLowerCase();
    }
    const { data } = await apiClient.post<LoginFaceAuthResponse>('/auth/face/login', body);
    return {
      user: data.user,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  },
};
