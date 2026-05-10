import { SignupForm } from '@/components/forms/SignupForm';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image - Optimized with Next.js Image */}
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
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Join IronPulse</h1>
          <p className="text-white/80">Start your transformation today</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
