import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCheckoutSessionSchema } from '../schemas/payment.schema';
import { paymentRateLimit } from '../middleware/rateLimit.middleware';
import {
  createCheckoutSession,
  verifyPayment,
  handlePaymentCallback,
  getAvailableGateways,
} from '../controllers/payment.controller';

const router = Router();

// Get available payment gateways (public)
router.get('/gateways', getAvailableGateways);

// Create Checkout Session (protected) - supports all gateways (10 requests per minute)
router.post(
  '/create-checkout-session',
  paymentRateLimit,
  authenticate,
  validate(createCheckoutSessionSchema),
  createCheckoutSession
);

// Verify payment (public - called from success page) - rate limited
router.get('/verify', paymentRateLimit, verifyPayment);

// Payment gateway callbacks (public - called by payment providers)
// Note: Callbacks are NOT rate limited as they come from payment providers
router.post('/:gateway/callback', handlePaymentCallback);
router.get('/:gateway/callback', handlePaymentCallback);

export default router;
