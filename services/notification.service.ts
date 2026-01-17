import { apiManager } from '@/lib/api-manager';
import type { Notification } from '@/types';

export interface NotificationPreferences {
  emailEnabled: boolean;
  inAppEnabled: boolean;
  digestEnabled: boolean;
}

export const notificationService = {
  getNotifications: async (limit: number = 20, offset: number = 0) => {
    const response = await apiManager.get<{
      notifications: Notification[];
      unreadCount: number;
      hasMore: boolean;
    }>(`/notifications?limit=${limit}&offset=${offset}`);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from API');
    return response.data;
  },

  markRead: async (notificationId: string) => {
    const response = await apiManager.post<Notification>(`/notifications/${notificationId}/read`);
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from API');
    return response.data;
  },

  markAllRead: async () => {
    const response = await apiManager.post<{ success: boolean }>('/notifications/read-all');
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from API');
    return response.data;
  },

  getPreferences: async () => {
    const response = await apiManager.get<NotificationPreferences>('/notifications/preferences');
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from API');
    return response.data;
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>) => {
    const response = await apiManager.patch<NotificationPreferences>(
      '/notifications/preferences',
      preferences
    );
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No data returned from API');
    return response.data;
  },
};
