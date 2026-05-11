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
import { Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      if (response.success) {
        setResetSuccess(true);
        toast.success('Password reset successful!');

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to reset password. The link may have expired.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (resetSuccess) {
    return (
      <Card className="w-full max-w-md bg-white/98 dark:bg-gray-100/98 backdrop-blur-xl border-2 border-green-500/40 shadow-2xl shadow-black/20">
        <CardHeader className="border-b border-green-500/20">
          <div className="flex items-center justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-gray-900 text-center">Password Reset Successful!</CardTitle>
          <CardDescription className="text-gray-600 text-center">
            Your password has been updated successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-600">
              You can now login with your new password.
            </p>
            <p className="text-sm text-gray-600">
              Redirecting to login page in 3 seconds...
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full gym-gradient"
              size="lg"
            >
              Go to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/98 dark:bg-gray-100/98 backdrop-blur-xl border-2 border-red-500/40 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-red-500/20">
        <CardTitle className="text-2xl text-gray-900">Set New Password</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('password')}
                disabled={isSubmitting}
                className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={isSubmitting}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
            <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-900">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                {...register('confirmPassword')}
                disabled={isSubmitting}
                className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={isSubmitting}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
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
                Resetting password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
