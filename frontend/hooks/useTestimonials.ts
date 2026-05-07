import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialService, Testimonial, CreateTestimonialInput, UpdateTestimonialInput } from '@/lib/services/testimonial.service';
import { toast } from 'sonner';

export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await testimonialService.getAllTestimonials();
      return response.data;
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

export function useTestimonial(id: string) {
  return useQuery<Testimonial>({
    queryKey: ['testimonials', id],
    queryFn: async () => {
      const response = await testimonialService.getTestimonialById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestimonialInput) => testimonialService.createTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create testimonial');
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestimonialInput }) =>
      testimonialService.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update testimonial');
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => testimonialService.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete testimonial');
    },
  });
}
