import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema } from '../schemas/booking.schema';
import { bookingRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// All booking routes require authentication and rate limiting (20 requests per minute)
router.post('/', bookingRateLimit, authenticate, validate(createBookingSchema), createBooking);
router.get('/', bookingRateLimit, authenticate, getUserBookings);
router.delete('/:id', bookingRateLimit, authenticate, cancelBooking);

export default router;
