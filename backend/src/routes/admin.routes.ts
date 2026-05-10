import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { adminRateLimit } from '../middleware/rateLimit.middleware';
import { getDashboardStats, getAdminBookings, getAdminPayments } from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication, admin role, and rate limiting (100 requests per minute)
router.use(adminRateLimit);
router.use(authenticate);
router.use(requireAdmin);

// Dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// Admin bookings management
router.get('/bookings', getAdminBookings);

// Admin payments management
router.get('/payments', getAdminPayments);

export default router;
