/**
 * Axios instance with auth interceptors
 *
 * Reusable axios instance for all API calls.
 * Handles 401 redirect to login and adds JWT token.
 */

import axios from 'axios';
import { useAuthStore } from '@/hooks/use-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add JWT token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 - redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    console.log('[API Error]', { status, message, url: error.config?.url });

    // Check for auth errors
    if (
      status === 401 ||
      status === 403 ||
      message?.includes('unauthorized') ||
      message?.includes('invalid token') ||
      message?.includes('Forbidden')
    ) {
      if (typeof window !== 'undefined') {
        console.log('[Auth] Redirecting to login due to auth error');
        // Clear auth store
        useAuthStore.getState().logout();
        localStorage.removeItem('auth-storage');
        // Redirect to login page
        const currentOrigin = window.location.origin;
        window.location.href = `${currentOrigin}/login`;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;