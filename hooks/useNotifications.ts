import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiManager } from '@/lib/api-manager';
import type { Notification } from '@/types';

const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const;

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  hasMore: boolean;
}

export function useNotifications(limit: number = 20) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<NotificationsResponse>({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, limit],
    queryFn: async (): Promise<NotificationsResponse> => {
      const response = await apiManager.get<NotificationsResponse>(
        `/notifications?limit=${limit}&offset=0`
      );
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
      }
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiManager.post(`/notifications/${notificationId}/read`);
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiManager.post('/notifications/read-all');
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    },
  });

  return {
    data,
    isLoading,
    unreadCount: (data as NotificationsResponse)?.unreadCount || 0,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
