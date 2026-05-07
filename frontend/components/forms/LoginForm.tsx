'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/schemas';
import { LoginFormData } from '@/types';
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

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Call backend API
      const response = await authService.login(data);

      if (response.success) {
        // Save token and user to store + localStorage
        const user = {
          ...response.data.user,
          role: response.data.user.role as 'MEMBER' | 'ADMIN',
          updatedAt: response.data.user.createdAt,
        };
        login(response.data.token, user);

        toast.success('Login successful! Welcome back.');

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error: any) {
      // Error handling - backend returns { success: false, message: string }
      const errorMessage = error?.message || 'Invalid email or password';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/98 dark:bg-gray-100/98 backdrop-blur-xl border-2 border-red-500/40 shadow-2xl shadow-black/20">
      <CardHeader className="border-b border-red-500/20">
        <CardTitle className="text-2xl text-gray-900">Login to Your Account</CardTitle>
        <CardDescription className="text-gray-600">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              autoComplete="current-password"
              {...register('password')}
              disabled={isSubmitting}
              className="bg-gray-50 text-gray-900 border-gray-300 placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500"
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password.message}</p>
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
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-red-600 hover:text-red-700 hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
