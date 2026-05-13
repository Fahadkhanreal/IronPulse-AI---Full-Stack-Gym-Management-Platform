'use client';

import { useState } from 'react';
import { PlanCard } from '@/components/features/PlanCard';
import { BookingModal } from '@/components/features/BookingModal';
import { usePlans } from '@/hooks/usePlans';
import { useAuthStore } from '@/store/authStore';
import { useActiveSubscription } from '@/hooks/useSubscriptions';
import { Plan } from '@/types';
import { PlanCardSkeleton } from '@/components/common/PlanCardSkeleton';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function PlansPage() {
  const { data: plans, isLoading } = usePlans();
  const { isAuthenticated } = useAuthStore();
  const { data: activeSubscription, isLoading: subLoading } = useActiveSubscription();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasActiveSubscription = !!(activeSubscription && new Date(activeSubscription.endDate) > new Date());

  const handleSelectPlan = (plan: Plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a session');
      router.push('/login');
      return;
    }

    if (hasActiveSubscription) {
      toast.error('You already have an active subscription. You can renew after it expires.');
      return;
    }

    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative h-[300px] mb-12">
        <Image
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
          alt="Membership plans background"
          fill
          priority
          className="object-cover"
          quality={75}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl md:text-5xl font-bold mb-4 text-white"
            >
              Membership Plans
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-xl text-white/90 max-w-2xl mx-auto px-4"
            >
              Choose the perfect plan for your fitness journey
            </motion.p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <PlanCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {plans?.map((plan, index) => (
            <motion.div
              key={plan.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.3,
                  },
                },
              }}
            >
              <PlanCard
                plan={plan}
                onSelectPlan={handleSelectPlan}
                isActive={hasActiveSubscription}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <p className="text-muted-foreground mb-4">
          Not sure which plan is right for you?
        </p>
        <motion.a
          href="/contact"
          className="text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact us for personalized recommendations
        </motion.a>
      </motion.div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedPlan={selectedPlan}
      />
      </div>
    </div>
  );
}
