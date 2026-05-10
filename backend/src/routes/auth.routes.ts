import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { signupSchema, loginSchema } from '../schemas/auth.schema';
import { authRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Apply strict rate limiting to auth endpoints (5 requests per 15 minutes)
router.post('/signup', authRateLimit, validate(signupSchema), signup);
router.post('/login', authRateLimit, validate(loginSchema), login);

export default router;
