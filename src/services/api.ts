import axios from 'axios';
import { Address, PincodeServiceability } from '../types/address';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1/';
// console.log("THIS  IS API BASE URL",API_BASE_URL)

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('authToken');
//       window.location.href = '/auth/login';
//     }
//     return Promise.reject(error);
//   }
// );

// Warehouse API functions
export const warehouseAPI = {
  // Get all warehouses for the authenticated user
  getWarehouses: async (params?: { page?: number; offset?: number; query?: string }) => {
    const response = await api.get('/warehouse', { params });
    return response.data;
  },

  // Get a specific warehouse by ID
  getWarehouse: async (id: string) => {
    const response = await api.get(`/warehouse/${id}`);
    return response.data;
  },

  // Create a new warehouse
  createWarehouse: async (data: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post('/warehouse', data);
    return response.data;
  },

  // Search warehouses by name or label
  searchWarehouses: async (query: string) => {
    const response = await api.get('/warehouse', {
      params: { query, offset: 10 }
    });
    return response.data;
  },
};

// Pincode serviceability API
export const pincodeAPI = {
  checkServiceability: async (pincode: string): Promise<{ data: PincodeServiceability }> => {
    const response = await api.get('/pincode-serviceablity', {
      params: { pincode }
    });
    console.log("response in the api ",response);
    
    return response.data;
  },
};

export default api;