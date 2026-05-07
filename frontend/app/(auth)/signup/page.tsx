import { SignupForm } from '@/components/forms/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-black/75 dark:bg-black/70" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-12">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Join IronPulse</h1>
          <p className="text-white/80">Start your transformation today</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
