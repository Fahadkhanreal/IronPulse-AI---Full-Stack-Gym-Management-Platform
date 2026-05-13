import { Router } from 'express';
import { getChatAnalytics, getPopularQuestions, getResponseTimes, getRevenueAnalytics } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// NO RATE LIMIT for analytics - completely removed

/**
 * All analytics routes require admin authentication
 */
router.use(authenticate, requireAdmin);

/**
 * GET /api/v1/admin/analytics/chat
 * Get chat analytics and statistics
 */
router.get('/chat', getChatAnalytics);

/**
 * GET /api/v1/admin/analytics/popular-questions
 * Get most frequently asked questions
 */
router.get('/popular-questions', getPopularQuestions);

/**
 * GET /api/v1/admin/analytics/response-times
 * Get average response times
 */
router.get('/response-times', getResponseTimes);

/**
 * GET /api/v1/admin/analytics/revenue
 * Get monthly revenue analytics
 */
router.get('/revenue', getRevenueAnalytics);

export default router;
