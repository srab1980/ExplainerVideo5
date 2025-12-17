// API Client with Error Handling
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';
import config from './config';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          // Forbidden
          throw new Error('You do not have permission to perform this action');
        case 404:
          // Not found
          throw new Error('The requested resource was not found');
        case 500:
          // Server error
          throw new Error('A server error occurred. Please try again later');
        default:
          throw new Error(data?.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection');
    } else {
      // Other errors
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

// Generic API methods
export class ApiClient {
  private client: AxiosInstance;
  
  constructor(client: AxiosInstance) {
    this.client = client;
  }
  
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }
  
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }
  
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }
  
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }
  
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: message,
      };
    }
  }
}

// Export configured API client
export const api = new ApiClient(apiClient);

// Specific API endpoints
export const userApi = {
  getAll: () => api.get('/api/users'),
  getById: (id: string) => api.get(`/api/users/${id}`),
  create: <T = unknown>(user: T) => api.post('/api/users', user),
  update: <T = unknown>(id: string, updates: T) => api.patch(`/api/users/${id}`, updates),
  delete: (id: string) => api.delete(`/api/users/${id}`),
};

export const taskApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/api/tasks', { params }),
  getById: (id: string) => api.get(`/api/tasks/${id}`),
  create: <T = unknown>(task: T) => api.post('/api/tasks', task),
  update: <T = unknown>(id: string, updates: T) => api.patch(`/api/tasks/${id}`, updates),
  delete: (id: string) => api.delete(`/api/tasks/${id}`),
};

export default api;