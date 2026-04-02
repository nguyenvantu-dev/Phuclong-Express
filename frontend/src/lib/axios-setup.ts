/**
 * Axios Global Setup
 *
 * Patches axios defaults to include auth interceptors for all API calls.
 * Run this once at app startup.
 */

import axios from 'axios';
import { useAuthStore } from '@/hooks/use-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Set default baseURL
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000;

// Add JWT token to all requests
axios.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 - redirect to login
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const url = error.config?.url || '';

    console.log('[API Error]', { status, message, url });

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

console.log('[Axios] Configured with auth interceptors, baseURL:', API_URL);