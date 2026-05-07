'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

const planSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(1, 'Duration must be at least 1 month'),
  features: z.string().min(1, 'Features are required'),
  stripePriceId: z.string().optional(),
});

type PlanFormData = z.infer<typeof planSchema>;

interface Plan {
  id: string;
  title: string;
  price: number;
  duration: number;
  features: string[];
  stripePriceId?: string;
}

interface PlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function PlanDialog({ open, onOpenChange, plan, onSubmit, isLoading }: PlanDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: plan
      ? {
          title: plan.title,
          price: plan.price,
          duration: plan.duration,
          features: plan.features.join('\n'),
          stripePriceId: plan.stripePriceId || '',
        }
      : {
          title: '',
          price: 0,
          duration: 1,
          features: '',
          stripePriceId: '',
        },
  });

  const handleFormSubmit = (data: PlanFormData) => {
    const formattedData = {
      ...data,
      features: data.features.split('\n').filter((f) => f.trim() !== ''),
    };

    if (plan) {
      onSubmit({ id: plan.id, ...formattedData });
    } else {
      onSubmit(formattedData);
    }

    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
          <DialogDescription>
            {plan ? 'Update the plan details below.' : 'Fill in the details to create a new plan.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Plan Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Basic Plan"
            />
            {errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price (PKR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              {...register('features')}
              placeholder="Access to gym equipment&#10;Personal trainer&#10;Nutrition plan"
              rows={5}
            />
            {errors.features && (
              <p className="text-sm text-red-500 mt-1">{errors.features.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="stripePriceId">Stripe Price ID (optional)</Label>
            <Input
              id="stripePriceId"
              {...register('stripePriceId')}
              placeholder="price_xxxxx"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="gym-gradient" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
