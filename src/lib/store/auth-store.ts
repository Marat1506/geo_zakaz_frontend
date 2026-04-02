import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@/types/auth';

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
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);

          // Set cookies for middleware
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = `accessToken=${tokens.accessToken}; path=/; max-age=3600; SameSite=Lax${secure}`;
          document.cookie = `refreshToken=${tokens.refreshToken}; path=/; max-age=604800; SameSite=Lax${secure}`;
          document.cookie = `userRole=${user.role}; path=/; max-age=3600; SameSite=Lax${secure}`;

          console.log('Cookies set for role:', user.role);
        }
        set({ user, tokens, isAuthenticated: true });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          // Clear cookies
          document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
          document.cookie = 'refreshToken=; path=/; max-age=0; SameSite=Lax';
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
