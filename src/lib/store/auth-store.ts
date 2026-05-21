import { create } from 'zustand';
import { User, AuthTokens } from '@/types/auth';
import { setTokens, clearTokens } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True after we tried to restore session from HTTP-only cookies via /auth/me */
  authReady: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setSession: (user: User) => void;
  clearAuth: () => void;
  setAuthReady: (ready: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  authReady: false,

  setAuth: (user, tokens) => {
    if (tokens.accessToken && tokens.refreshToken) {
      setTokens(tokens.accessToken, tokens.refreshToken);
    } else {
      clearTokens();
    }
    set({ user, isAuthenticated: true, authReady: true });
  },

  setSession: (user) => {
    clearTokens();
    set({ user, isAuthenticated: true, authReady: true });
  },

  clearAuth: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false, authReady: true });
  },

  setAuthReady: (ready) => set({ authReady: ready }),

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
