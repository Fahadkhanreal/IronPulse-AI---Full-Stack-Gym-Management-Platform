import { z } from 'zod';

export const createTrainerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    specialization: z.string().min(2, 'Specialization must be at least 2 characters').max(100, 'Specialization must be less than 100 characters'),
    experience: z.number().int().positive('Experience must be a positive integer'),
    image: z.string().url('Image must be a valid URL'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  }),
});

export const updateTrainerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
    specialization: z.string().min(2, 'Specialization must be at least 2 characters').max(100, 'Specialization must be less than 100 characters').optional(),
    experience: z.number().int().positive('Experience must be a positive integer').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  }),
});

export type CreateTrainerInput = z.infer<typeof createTrainerSchema>['body'];
export type UpdateTrainerInput = z.infer<typeof updateTrainerSchema>['body'];
