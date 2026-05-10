import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApprovedTestimonials,
  submitTestimonial,
  getMyTestimonials,
  updateMyTestimonial,
  deleteMyTestimonial,
  Testimonial,
  CreateTestimonialData,
  UpdateTestimonialData
} from '@/lib/services/testimonials.service';
import { toast } from 'sonner';

// Get all approved testimonials (public)
export function useTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: getApprovedTestimonials,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// Get my testimonials (authenticated member)
export function useMyTestimonials() {
  return useQuery<Testimonial[]>({
    queryKey: ['my-testimonials'],
    queryFn: getMyTestimonials,
  });
}

// Create testimonial (authenticated member)
export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestimonialData) => submitTestimonial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['my-testimonials'] });
      toast.success('Testimonial submitted successfully! It will be reviewed by admin.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit testimonial');
    },
  });
}

// Update my testimonial (authenticated member)
export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTestimonialData }) =>
      updateMyTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['my-testimonials'] });
      toast.success('Testimonial updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update testimonial');
    },
  });
}

// Delete my testimonial (authenticated member)
export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMyTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['my-testimonials'] });
      toast.success('Testimonial deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete testimonial');
    },
  });
}
