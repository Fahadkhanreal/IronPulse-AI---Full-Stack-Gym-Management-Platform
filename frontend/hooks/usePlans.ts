import { useQuery } from '@tanstack/react-query';
import { Plan } from '@/types';
import { planService } from '@/lib/services/plan.service';

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const response = await planService.getAllPlans();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
