'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle } from 'lucide-react';
import api from '@/lib/api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password', data);

      if (response && (response as any).success) {
        setEmailSent(true);
        toast.success('Password reset link sent! Check your email.');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send reset link. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md bg-white/98 dark:bg-gray-100/98 backdrop-blur-xl border-2 border-green-500/40 shadow-2xl shadow-black/20">
        <CardHeader className="border-b border-green-500/20">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900 text-center">Check Your Email</CardTitle>
          <CardDescription className="text-gray-600 text-center">
            We&apos;ve sent a password reset link to <strong>{getValues('email')}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              Click the link in the email to reset your password. The link will expire in 1 hour.
            </p>
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="text-red-600 hover:text-red-700 font-semibold hover:underline"
              >
                try again
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/98 dark:bg-gray-100/98 backdrop-blur-xl border-2 border-red-500/40 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-red-500/20">
        <CardTitle className="text-2xl text-gray-900">Reset Your Password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                autoComplete="email"
                {...register('email')}
                disabled={isSubmitting}
                className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pl-10"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full gym-gradient"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending reset link...
              </>
            ) : (
              'Send Reset Link'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
