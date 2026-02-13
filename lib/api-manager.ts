import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '@/types';

class ApiManager {
  private client: AxiosInstance;

  constructor() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    this.client = axios.create({
      baseURL: baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`,
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Check if response is HTML when we expected JSON
        const contentType = response.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          const error: ApiError = {
            message: 'Received HTML response instead of JSON. This usually means the API endpoint was not found or a page route was hit instead.',
            code: 'INVALID_RESPONSE_FORMAT',
            statusCode: response.status,
          };
          return Promise.reject(error);
        }
        return response;
      },
      (error: AxiosError<ApiError>) => {
        // Check if the error response itself is HTML
        if (error.response?.headers['content-type']?.includes('text/html')) {
          const apiError: ApiError = {
            message: 'Received HTML error page instead of JSON. Check backend logs.',
            code: 'SERVER_ERROR_HTML',
            statusCode: error.response?.status,
          };
          return Promise.reject(apiError);
        }

        const responseData = error.response?.data as any;
        const apiError: ApiError = {
          message: responseData?.error?.message || responseData?.message || error.message || 'An error occurred',
          code: responseData?.error?.code || responseData?.code,
          statusCode: error.response?.status,
        };

        // Handle specific error cases
        if (error.response?.status === 401) {
          const requestUrl = error.config?.url || '';
          const isAuthCheck = requestUrl.includes('/auth/me');
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
