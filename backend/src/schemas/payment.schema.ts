import { z } from 'zod';

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    planId: z.string().min(1, 'Plan ID is required'),
    gateway: z.string().optional(),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  }),
});

export type CreateCheckoutSessionInput = z.infer<typeof createCheckoutSessionSchema>['body'];
