import { useMutation, useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/payment.service';
import { toast } from 'sonner';

/**
 * Hook to get available payment gateways
 */
export const useAvailableGateways = () => {
  return useQuery({
    queryKey: ['payment-gateways'],
    queryFn: paymentService.getAvailableGateways,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create checkout session
 */
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: ({
      planId,
      gateway,
    }: {
      planId: string;
      gateway?: string;
    }) => paymentService.createCheckoutSession(planId, gateway),
    onSuccess: (data) => {
      // Redirect to checkout URL
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to get checkout URL');
      }
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create checkout session';
      toast.error(message);
    },
  });
};

/**
 * Hook to verify payment
 */
export const useVerifyPayment = (sessionId: string | null, gateway?: string) => {
  return useQuery({
    queryKey: ['verify-payment', sessionId, gateway],
    queryFn: () => paymentService.verifyPayment(sessionId!, gateway),
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1000,
  });
};
