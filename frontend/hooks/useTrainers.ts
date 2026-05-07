import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerService, Trainer, CreateTrainerInput, UpdateTrainerInput } from '@/lib/services/trainer.service';
import { toast } from 'sonner';

export function useTrainers() {
  return useQuery<Trainer[]>({
    queryKey: ['trainers'],
    queryFn: async () => {
      const response = await trainerService.getAllTrainers();
      return response.data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useTrainer(id: string) {
  return useQuery<Trainer>({
    queryKey: ['trainers', id],
    queryFn: async () => {
      const response = await trainerService.getTrainerById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTrainerInput) => trainerService.createTrainer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create trainer');
    },
  });
}

export function useUpdateTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTrainerInput }) =>
      trainerService.updateTrainer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update trainer');
    },
  });
}

export function useDeleteTrainer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => trainerService.deleteTrainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast.success('Trainer deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete trainer');
    },
  });
}
