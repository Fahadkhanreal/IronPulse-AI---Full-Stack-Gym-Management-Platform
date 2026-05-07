import api from '@/lib/api';

interface Plan {
  id: string;
  title: string;
  price: number;
  duration: number;
  features: string[];
  createdAt: string;
}

interface PlansResponse {
  success: boolean;
  message: string;
  data: Plan[];
}

interface PlanResponse {
  success: boolean;
  message: string;
  data: Plan;
}

export const planService = {
  // Get all plans (public)
  async getAllPlans(): Promise<PlansResponse> {
    return await api.get('/plans');
  },

  // Get single plan (public)
  async getPlanById(id: string): Promise<PlanResponse> {
    return await api.get(`/plans/${id}`);
  },
};
