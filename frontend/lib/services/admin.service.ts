import api from '@/lib/api';
import { DashboardStats, FilterParams, PaginatedResponse, AdminBooking, AdminPayment } from '@/types/admin';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AdminMember {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  hasActiveSubscription: boolean;
  activePlan: {
    id: string;
    title: string;
    price: number;
  } | null;
  totalSpent: number;
}

export const adminService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return await api.get('/admin/dashboard/stats');
  },

  /**
   * Get all bookings with filters
   */
  async getBookings(params?: FilterParams): Promise<ApiResponse<PaginatedResponse<AdminBooking>>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `/admin/bookings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await api.get(url);
  },

  /**
   * Get all payments with filters
   */
  async getPayments(params?: FilterParams): Promise<ApiResponse<PaginatedResponse<AdminPayment>>> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `/admin/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await api.get(url);
  },

  /**
   * Get all members with filters
   */
  async getMembers(params?: FilterParams): Promise<ApiResponse<PaginatedResponse<AdminMember>>> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.hasSubscription) queryParams.append('hasSubscription', params.hasSubscription);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await api.get(url);
  },
};
