import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80"
        alt="Gym background"
        fill
        priority
        className="object-cover"
        quality={75}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/75 dark:bg-black/70 z-10" />

      <div className="relative z-20 w-full max-w-md mx-auto px-4 py-12">
        {/* Back to Login Link */}
        <Link
          href="/login"
          className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Forgot Password?</h1>
          <p className="text-white/80">
            Enter your email and we&apos;ll send you a link to reset your password
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
