'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function MockCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  const sessionId = searchParams.get('session');
  const amount = searchParams.get('amount');
  const planTitle = searchParams.get('plan');

  useEffect(() => {
    // Auto-redirect if no session
    if (!sessionId) {
      router.push('/plans');
    }
  }, [sessionId, router]);

  const handleSuccess = async () => {
    setIsProcessing(true);

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Redirect to success page
    router.push(`/payment/success?session_id=${sessionId}`);
  };

  const handleFailure = () => {
    router.push('/payment/cancel');
  };

  if (!sessionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="text-center border-b border-primary/10">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Mock Payment Gateway</CardTitle>
            <CardDescription className="text-base">
              🧪 Test Mode - No Real Payment Required
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Payment Details */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Plan:</span>
                <span className="font-semibold">{planTitle || 'Gym Plan'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-semibold text-lg">PKR {amount || '0'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Session ID:</span>
                <span className="font-mono text-xs">{sessionId.substring(0, 20)}...</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                <strong>Test Mode:</strong> This is a mock payment gateway for testing.
                No real payment will be processed. Click "Simulate Success" to complete the test payment.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSuccess}
                disabled={isProcessing}
                className="w-full gym-gradient text-lg h-12"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Simulate Success
                  </>
                )}
              </Button>

              <Button
                onClick={handleFailure}
                disabled={isProcessing}
                variant="outline"
                className="w-full h-12"
                size="lg"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Simulate Failure
              </Button>
            </div>

            {/* Gateway Info */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t">
              <p>Mock Payment Gateway v1.0</p>
              <p className="mt-1">For testing purposes only</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <MockCheckoutContent />
    </Suspense>
  );
}
