import { Payment, PaymentStatus } from './payment';
import { Booking } from './index';

export interface DashboardStats {
  totalRevenue: number;
  activeMembers: number;
  totalBookings: number;
  recentPayments: Payment[];
}

export interface AdminBooking extends Omit<Booking, 'user' | 'plan'> {
  user: {
    id: string;
    name: string;
    email: string;
  };
  plan: {
    id: string;
    title: string;
    price: number;
  };
  payment?: Payment;
}

export interface AdminPayment extends Omit<Payment, 'user' | 'plan'> {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  plan?: {
    id: string;
    title: string;
    price: number;
  };
}

export interface FilterParams {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  hasSubscription?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
