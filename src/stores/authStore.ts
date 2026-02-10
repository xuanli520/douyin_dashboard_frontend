import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AuthState } from '@/types';
import { getAccessToken, clearTokens } from '@/lib/auth';

interface AuthStore extends AuthState {
  setAuthenticated: (userId: number, username: string) => void;
  setUnauthenticated: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

const AUTH_VERSION = 1;

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        isLoading: true,
        userId: null,
        username: null,

        setAuthenticated: (userId: number, username: string) => {
          set({
            isAuthenticated: true,
            isLoading: false,
            userId,
            username,
          });
        },

        setUnauthenticated: () => {
          clearTokens();
          set({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
            username: null,
          });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        initialize: () => {
          const hasToken = !!getAccessToken();
          if (hasToken) {
            set({ isLoading: false });
          } else {
            set({
              isAuthenticated: false,
              isLoading: false,
              userId: null,
              username: null,
            });
          }
        },
      }),
      {
        name: 'auth-storage',
        version: AUTH_VERSION,
        partialize: (state) => ({
          isAuthenticated: state.isAuthenticated,
          userId: state.userId,
          username: state.username,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuthStore();
  return { isAuthenticated: isAuthenticated && !isLoading, isLoading };
}

export function initializeAuth() {
  useAuthStore.getState().initialize();
}
