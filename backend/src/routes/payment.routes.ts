import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCheckoutSessionSchema } from '../schemas/payment.schema';
import {
  createCheckoutSession,
  verifyPayment,
  handlePaymentCallback,
  getAvailableGateways,
} from '../controllers/payment.controller';

const router = Router();

// Get available payment gateways (public)
router.get('/gateways', getAvailableGateways);

// Create Checkout Session (protected) - supports all gateways
router.post(
  '/create-checkout-session',
  authenticate,
  validate(createCheckoutSessionSchema),
  createCheckoutSession
);

// Verify payment (public - called from success page)
router.get('/verify', verifyPayment);

// Payment gateway callbacks (public - called by payment providers)
router.post('/:gateway/callback', handlePaymentCallback);
router.get('/:gateway/callback', handlePaymentCallback);

export default router;
