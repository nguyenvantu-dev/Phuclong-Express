import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore, getAccessToken } from './use-auth';

interface AuthContextType {
  user: {
    id: string | null;
    username: string | null;
    email: string | null;
    roles?: string[];
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Auth Context Provider
 *
 * Replaces NextAuth SessionProvider with localStorage-based auth.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, setTokens, setUser, logout: clearStore } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const token = getAccessToken();
    if (token) {
      // Optionally validate token with backend here
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    console.log('[Login] Calling:', `${API_URL}/auth/login`);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log('[Login] Response:', response.status, response.statusText);
    if (!response.ok) {
      const err = await response.json();
      console.log('[Login] Error:', err);
      throw new Error('Invalid credentials');
    }

    const data = await response.json();

    if (data.accessToken && data.refreshToken) {
      setTokens(data.accessToken, data.refreshToken);
      setUser({
        id: String(data.user?.id || ''),
        username: data.user?.username || username,
        email: data.user?.email || '',
        roles: data.user?.roles || [],
      });

      // Set cookie for middleware
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400; SameSite=Lax`;
    }
  };

  const logout = () => {
    clearStore();
  };

  return (
    <AuthContext.Provider
      value={{
        user: isAuthenticated ? user : null,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
