'use client';

import { TrainerCard } from '@/components/features/TrainerCard';
import { TrainerCardSkeleton } from '@/components/common/TrainerCardSkeleton';
import { motion } from 'framer-motion';
import { useTrainers } from '@/hooks/useTrainers';

export default function TrainersPage() {
  const { data: trainers, isLoading } = useTrainers();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Meet Our Trainers
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Our certified professionals are here to guide you every step of the way. Each trainer
          brings unique expertise and passion to help you reach your fitness goals.
        </motion.p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <TrainerCardSkeleton key={i} />
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
          {trainers?.map((trainer, index) => (
            <motion.div
              key={trainer.id}
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
              <TrainerCard trainer={trainer} />
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
          Want to work with a specific trainer?
        </p>
        <motion.a
          href="/contact"
          className="text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Contact us to schedule a consultation
        </motion.a>
      </motion.div>
    </div>
  );
}
