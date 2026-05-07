'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/schemas';
import { SignupFormData } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/lib/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    try {
      // Call backend API - only send name, email, password (not confirmPassword or acceptTerms)
      const response = await authService.signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.success) {
        // Save token and user to store + localStorage
        const user = {
          ...response.data.user,
          role: response.data.user.role as 'MEMBER' | 'ADMIN',
          updatedAt: response.data.user.createdAt,
        };
        login(response.data.token, user);

        toast.success('Account created successfully! Welcome to IronPulse Gym.');

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Error handling - backend returns { success: false, message: string, error?: string }
      const errorMessage = error?.message || 'Failed to create account. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/98 dark:bg-gray-100/98 backdrop-blur-xl border-2 border-red-500/40 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-red-500/20">
        <CardTitle className="text-2xl text-gray-900">Create Your Account</CardTitle>
        <CardDescription className="text-gray-600">
          Join IronPulse Gym and start your fitness journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              autoComplete="name"
              {...register('name')}
              disabled={isSubmitting}
              className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-900">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              autoComplete="email"
              {...register('email')}
              disabled={isSubmitting}
              className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-900">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              disabled={isSubmitting}
              className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-900">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              disabled={isSubmitting}
              className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-2">
            <input
              type="checkbox"
              id="acceptTerms"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
              {...register('acceptTerms')}
              disabled={isSubmitting}
            />
            <Label htmlFor="acceptTerms" className="text-sm font-normal cursor-pointer text-gray-700">
              I agree to the terms and conditions
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-red-600">{errors.acceptTerms.message}</p>
          )}

          <Button
            type="submit"
            className="w-full gym-gradient"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/login" className="text-red-600 hover:text-red-700 hover:underline font-semibold">
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
