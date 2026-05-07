import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { Trainer } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <Link href="/contact" className="block">
      <motion.div
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          rotateX: 5,
          transition: { duration: 0.3 },
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 relative group cursor-pointer">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover:opacity-100 z-0"
          transition={{ duration: 0.4 }}
        />

        <motion.div
          className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Trainer Image */}
          {trainer.image ? (
            <img
              src={trainer.image}
              alt={trainer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                style={{
                  backgroundImage: 'radial-gradient(circle, #ef4444 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="h-24 w-24 text-muted-foreground relative z-10" aria-hidden="true" />
              </motion.div>
            </>
          )}

          {/* Gradient overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <CardHeader className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CardTitle>{trainer.name}</CardTitle>
            <CardDescription>{trainer.specialization}</CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="relative z-10">
          <motion.p
            className="text-sm text-muted-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {trainer.experience} years of experience
          </motion.p>
          {trainer.bio && (
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {trainer.bio}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
    </Link>
  );
}
