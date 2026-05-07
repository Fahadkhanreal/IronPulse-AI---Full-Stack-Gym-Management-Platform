import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Booking } from '@/types';
import { bookingService } from '@/lib/services/booking.service';
import { toast } from 'sonner';

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await bookingService.getMyBookings();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      // Invalidate bookings query to refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking created successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to create booking';
      toast.error(errorMessage);
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      // Invalidate bookings query to refetch
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
    },
  });
}
