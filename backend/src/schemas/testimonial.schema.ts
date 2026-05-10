import { z } from 'zod';

/**
 * Schema for creating a testimonial (Member)
 * Members submit their own testimonials
 */
export const createTestimonialSchema = z.object({
  body: z.object({
    text: z
      .string()
      .min(10, 'Testimonial text must be at least 10 characters')
      .max(500, 'Testimonial text must not exceed 500 characters'),
    rating: z
      .number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must not exceed 5')
      .optional()
      .default(5),
    image: z
      .string()
      .url('Image must be a valid URL')
      .optional()
      .nullable(),
  }),
});

/**
 * Schema for updating a testimonial (Member)
 * Members can update their own pending/rejected testimonials
 */
export const updateTestimonialSchema = z.object({
  body: z.object({
    text: z
      .string()
      .min(10, 'Testimonial text must be at least 10 characters')
      .max(500, 'Testimonial text must not exceed 500 characters')
      .optional(),
    rating: z
      .number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must not exceed 5')
      .optional(),
    image: z
      .string()
      .url('Image must be a valid URL')
      .optional()
      .nullable(),
  }),
});

/**
 * Schema for admin testimonial queries
 */
export const adminTestimonialQuerySchema = z.object({
  query: z.object({
    status: z
      .enum(['PENDING', 'APPROVED', 'REJECTED'])
      .optional(),
  }),
});
