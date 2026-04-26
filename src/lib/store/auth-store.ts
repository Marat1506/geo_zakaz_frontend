import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@/types/auth';
import { setTokens, clearTokens } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setAuth: (user, tokens) => {
        setTokens(tokens.accessToken, tokens.refreshToken);

        if (typeof window !== 'undefined') {
          // Keep only role cookie client-visible for Next middleware role routing.
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `userRole=${user.role}; path=/; max-age=3600; SameSite=Lax${secure}`;
        }
        set({ user, tokens, isAuthenticated: true });
      },

      clearAuth: () => {
        clearTokens();

        if (typeof window !== 'undefined') {
          document.cookie = 'userRole=; path=/; max-age=0; SameSite=Lax';
        }
        set({ user: null, tokens: null, isAuthenticated: false });
      },

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      skipHydration: false,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
