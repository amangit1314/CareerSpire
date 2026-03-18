import { apiManager } from '@/lib/api-manager';
import type { DashboardStats } from '@/types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await apiManager.get<DashboardStats>('/dashboard');
    if (response.error) {
      throw new Error(typeof response.error === 'string' ? response.error : response.error.message);
    }
    if (!response.data) throw new Error('No dashboard data returned');
    return response.data;
  },
};
