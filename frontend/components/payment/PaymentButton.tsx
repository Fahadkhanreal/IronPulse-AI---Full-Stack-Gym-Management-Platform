'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useCreateCheckout } from '@/lib/hooks/usePayment';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaymentButtonProps {
  planId: string;
  planTitle: string;
  gateway?: string;
  disabled?: boolean;
}

export function PaymentButton({ planId, planTitle, gateway, disabled }: PaymentButtonProps) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const createCheckout = useCreateCheckout();

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('Please create an account to subscribe to a plan', {
        description: 'You need to sign up first to access our membership plans',
        duration: 3000,
      });

      setTimeout(() => {
        router.push('/signup');
      }, 1000);
      return;
    }

    createCheckout.mutate({ planId, gateway });
  };

  return (
    <Button
      className="w-full gym-gradient"
      size="lg"
      onClick={handlePayment}
      disabled={disabled || createCheckout.isPending}
      aria-label={`Subscribe to ${planTitle}`}
    >
      {createCheckout.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        'Subscribe Now'
      )}
    </Button>
  );
}
