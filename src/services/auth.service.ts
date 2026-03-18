import { apiManager } from '@/lib/api-manager';
import type { SignUpRequest, SignInRequest, AuthResponse, User } from '@/types';

export const authService = {
  signUp: async (data: SignUpRequest): Promise<AuthResponse> => {
    const response = await apiManager.post<AuthResponse>('/auth/signup', data);

    // Check if we accidentally got HTML (e.g. hitting a page route)
    // && response.includes('<!DOCTYPE html>')
    if (typeof response === 'string') {
      throw new Error('Received HTML response instead of JSON. Check if the API route exists or if baseURL is correct.');
    }

    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from signup');
    return response.data;
  },

  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    const response = await apiManager.post<AuthResponse>('/auth/signin', data);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from signin');
    console.log("Signing response: ", JSON.stringify(response));
    return response.data;
  },

  signOut: async (): Promise<void> => {
    await apiManager.post('/auth/signout');
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await apiManager.get<User>('/auth/me');
      if (response.error) {
        const message = typeof response.error === 'string' ? response.error : response.error.message;
        throw new Error(message);
      }
      if (!response.data) return null;
      return response.data;
    } catch (error: unknown) {
      const statusCode = (error as { statusCode?: number })?.statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return null;
      }
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiManager.patch<User>('/auth/profile', data);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No profile data returned');
    return response.data;
  },
};
