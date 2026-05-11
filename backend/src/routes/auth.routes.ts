import { Router } from 'express';
import { signup, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema';
import { authRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply strict rate limiting to auth endpoints (15 requests per 5 minutes)
router.post('/signup', authRateLimit, validate(signupSchema), signup);
router.post('/login', authRateLimit, validate(loginSchema), login);
router.post('/forgot-password', authRateLimit, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimit, validate(resetPasswordSchema), resetPassword);

export default router;
