'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useVerifyPayment } from '@/lib/hooks/usePayment';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const gateway = searchParams.get('gateway');

  const { data: verification, isLoading, isError } = useVerifyPayment(sessionId, gateway || undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image - Optimized */}
        <Image
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80"
          alt="Payment background"
          fill
          className="object-cover"
          quality={75}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70 dark:bg-black/60 z-10" />

        <Card className="w-full max-w-md relative z-20 mx-4">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg">Verifying your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !verification?.verified) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Background Image - Optimized */}
        <Image
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80"
          alt="Payment background"
          fill
          className="object-cover"
          quality={75}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/70 dark:bg-black/60 z-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 mx-4"
        >
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
              >
                <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </motion.div>
              <CardTitle className="text-2xl">Payment Verification Failed</CardTitle>
              <CardDescription>
                We couldn't verify your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  There was an issue verifying your payment. Please contact support if you were charged.
                </p>
              </div>

              <div className="space-y-2">
                <Link href="/plans" className="block">
                  <Button className="w-full gym-gradient" size="lg">
                    Try Again
                  </Button>
                </Link>
                <Link href="/contact" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image - Optimized */}
      <Image
        src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=80"
        alt="Payment background"
        fill
        className="object-cover"
        quality={75}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/70 dark:bg-black/60 z-10" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-20 mx-4"
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
            >
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your membership has been confirmed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Thank you for your purchase! Your subscription has been activated and you can now access your membership benefits.
              </p>
              <div className="pt-2 border-t border-border space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono">{verification.transactionId.substring(0, 16)}...</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">{verification.amount} {verification.gateway.toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Gateway:</span>
                  <span className="uppercase">{verification.gateway}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold uppercase">{verification.status}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Link href="/dashboard" className="block">
                <Button className="w-full gym-gradient" size="lg">
                  View My Dashboard
                </Button>
              </Link>
              <Link href="/plans" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Browse More Plans
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
