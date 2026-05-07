import { Router } from 'express';
import { getUserSubscriptions, getActiveSubscription } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.get('/', authenticate, getUserSubscriptions);
router.get('/active', authenticate, getActiveSubscription);

export default router;
