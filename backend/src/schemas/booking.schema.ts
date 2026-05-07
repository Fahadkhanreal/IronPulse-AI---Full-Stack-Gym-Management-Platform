import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    planId: z.string().cuid('Invalid plan ID format'),
    bookingDate: z.string().datetime('Invalid date format').refine((date) => {
      const bookingDate = new Date(date);
      const now = new Date();
      return bookingDate > now;
    }, 'Booking date must be in the future'),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
