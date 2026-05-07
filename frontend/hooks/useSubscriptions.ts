import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    title: string;
    price: number;
    duration: number;
    features: string[];
  };
}

export const useSubscriptions = () => {
  return useQuery<Subscription[]>({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const response = await api.get('/subscriptions');
      return response.data;
    },
  });
};

export const useActiveSubscription = () => {
  return useQuery<Subscription | null>({
    queryKey: ['active-subscription'],
    queryFn: async () => {
      const response = await api.get('/subscriptions/active');
      return response.data;
    },
  });
};
