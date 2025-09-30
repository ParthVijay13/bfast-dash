import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage when available (client-side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - only redirect if we're not already on login/auth pages
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      if (!currentPath.includes('/login') && !currentPath.includes('/signin') && !currentPath.includes('/signup')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          console.warn('Authentication failed, redirecting to login');
          window.location.href = '/signin';
        }
      }
    } else if (error.response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden');
    } else if (error.response?.status >= 500) {
      // Server error
      console.error('Server error:', error.response?.data?.message);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'NETWORK_ERROR') {
      // Network error - don't redirect, just log
      console.error('Network error - API server may be down');
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiRequest = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.get(url, config),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post(url, data, config),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.put(url, data, config),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete(url, config),
};

export default api;
