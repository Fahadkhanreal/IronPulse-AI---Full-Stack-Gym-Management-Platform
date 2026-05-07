import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
    email: z.string().email('Invalid email format').optional(),
  }).refine((data) => data.name || data.email, {
    message: 'At least one field (name or email) must be provided',
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
