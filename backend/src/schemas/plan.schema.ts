import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(50, 'Title must be less than 50 characters'),
    price: z.number().positive('Price must be a positive number'),
    duration: z.number().int().positive('Duration must be a positive integer'),
    features: z.array(z.string()).min(1, 'At least one feature is required'),
    stripePriceId: z.string().optional(),
  }),
});

export const updatePlanSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(50, 'Title must be less than 50 characters').optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    duration: z.number().int().positive('Duration must be a positive integer').optional(),
    features: z.array(z.string()).min(1, 'At least one feature is required').optional(),
    stripePriceId: z.string().optional(),
  }),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>['body'];
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>['body'];
