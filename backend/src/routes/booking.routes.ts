import { Router } from 'express';
import { createBooking, getUserBookings, cancelBooking } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema } from '../schemas/booking.schema';

const router = Router();

// All booking routes require authentication
router.post('/', authenticate, validate(createBookingSchema), createBooking);
router.get('/', authenticate, getUserBookings);
router.delete('/:id', authenticate, cancelBooking);

export default router;
