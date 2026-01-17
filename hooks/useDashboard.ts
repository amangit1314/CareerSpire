import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats } from '@/types';

const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export const useDashboard = () => {
  return useQuery<DashboardStats>({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => dashboardService.getStats(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
