import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types';

interface ApiErrorWithMeta extends Error {
  code?: string;
  statusCode?: number;
}

class ApiManager {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api/',
      timeout: 120000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to normalize URLs (remove leading slashes if baseURL is used)
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (config.url?.startsWith('/')) {
          config.url = config.url.substring(1);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          const apiError: ApiErrorWithMeta = new Error('Received HTML response instead of JSON. Check if the API route exists.');
          apiError.code = 'INVALID_RESPONSE_FORMAT';
          apiError.statusCode = response.status;
          return Promise.reject(apiError);
        }
        return response;
      },
      (error: AxiosError<{ error?: { message?: string; code?: string }; message?: string; code?: string }>) => {
        // Check if the error response itself is HTML
        if (error.response?.headers['content-type']?.includes('text/html')) {
          const apiError: ApiErrorWithMeta = new Error('Received HTML error page instead of JSON. Check backend logs.');
          apiError.code = 'SERVER_ERROR_HTML';
          apiError.statusCode = error.response?.status;
          return Promise.reject(apiError);
        }

        const responseData = error.response?.data;
        const message = responseData?.error?.message || responseData?.message || error.message || 'An error occurred';

        const apiError: ApiErrorWithMeta = new Error(message);
        apiError.code = responseData?.error?.code || responseData?.code || (error.code as string);
        apiError.statusCode = error.response?.status;

        // Handle specific error cases
        if (error.response?.status === 401) {
          const requestUrl = error.config?.url || '';
          const isAuthCheck = requestUrl.includes('auth/me');
          if (typeof window !== 'undefined' && !isAuthCheck) {
            const isAuthPage = window.location.pathname.startsWith('/auth/');
            if (!isAuthPage) {
              window.location.href = '/auth/login';
            }
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export const apiManager = new ApiManager();
