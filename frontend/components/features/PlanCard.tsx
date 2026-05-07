import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { Plan } from '@/types';
import { motion } from 'framer-motion';
import { PaymentButton } from '@/components/payment/PaymentButton';
import { useAuthStore } from '@/store/authStore';

interface PlanCardProps {
  plan: Plan;
  onSelectPlan?: (plan: Plan) => void;
}

export function PlanCard({ plan, onSelectPlan }: PlanCardProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <Card className="flex flex-col h-full hover:border-primary transition-all duration-300 relative overflow-hidden group hover:scale-105 hover:shadow-xl">
      {/* Animated gradient background on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 pointer-events-none"
        transition={{ duration: 0.4 }}
      />

      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      />

      <CardHeader className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-2xl">{plan.title}</CardTitle>
        </motion.div>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground inline-block">
            PKR {plan.price}
          </span>
          <span className="text-muted-foreground">/month</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 relative z-10">
        <p className="text-sm text-muted-foreground mb-4">
          {plan.duration} month{plan.duration > 1 ? 's' : ''} duration
        </p>
        <ul className="space-y-2" aria-label={`Features of ${plan.title} plan`}>
          {plan.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start gap-2"
            >
              <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="relative z-20">
        <div className="w-full">
          <PaymentButton
            planId={plan.id}
            planTitle={plan.title}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
