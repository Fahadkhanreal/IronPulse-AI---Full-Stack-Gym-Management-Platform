import { z } from 'zod';

export const createTestimonialSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    text: z.string().min(10, 'Testimonial text must be at least 10 characters').max(1000, 'Testimonial text must be less than 1000 characters'),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    image: z.string().url('Image must be a valid URL'),
    role: z.string().max(50, 'Role must be less than 50 characters').optional(),
  }),
});

export const updateTestimonialSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
    text: z.string().min(10, 'Testimonial text must be at least 10 characters').max(1000, 'Testimonial text must be less than 1000 characters').optional(),
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').optional(),
    image: z.string().url('Image must be a valid URL').optional(),
    role: z.string().max(50, 'Role must be less than 50 characters').optional(),
  }),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>['body'];
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>['body'];
