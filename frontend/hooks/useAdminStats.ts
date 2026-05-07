import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import { DashboardStats, FilterParams } from '@/types/admin';

export function useAdminStats() {
  return useQuery<DashboardStats>({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminService.getDashboardStats();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAdminBookings(params?: FilterParams) {
  return useQuery({
    queryKey: ['admin', 'bookings', params],
    queryFn: async () => {
      const response = await adminService.getBookings(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useAdminPayments(params?: FilterParams) {
  return useQuery({
    queryKey: ['admin', 'payments', params],
    queryFn: async () => {
      const response = await adminService.getPayments(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
