import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string | null;
    username: string | null;
    email: string | null;
    roles?: string[];
  } | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: { id: string; username: string; email: string; roles?: string[] }) => void;
  logout: () => void;
}

/**
 * Auth Store with localStorage persistence
 *
 * Stores tokens and user info in localStorage for client-side access.
 * Used alongside NextAuth for server-side session validation.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      setUser: (user) =>
        set({
          user,
        }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to get token for API calls
 */
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return useAuthStore.getState().accessToken;
};

/**
 * Hook to check if user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  return useAuthStore((state) => state.isAuthenticated);
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  return useAuthStore((state) => state.user);
};
