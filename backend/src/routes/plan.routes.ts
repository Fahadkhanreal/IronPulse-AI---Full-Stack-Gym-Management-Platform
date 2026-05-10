import { Router } from 'express';
import { getAllPlans, getPlanById, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPlanSchema, updatePlanSchema } from '../schemas/plan.schema';
import { publicApiRateLimit, adminRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Public routes (60 requests per minute per IP)
router.get('/', publicApiRateLimit, getAllPlans);
router.get('/:id', publicApiRateLimit, getPlanById);

// Admin-only routes (100 requests per minute)
router.post('/', adminRateLimit, authenticate, requireAdmin, validate(createPlanSchema), createPlan);
router.put('/:id', adminRateLimit, authenticate, requireAdmin, validate(updatePlanSchema), updatePlan);
router.delete('/:id', adminRateLimit, authenticate, requireAdmin, deletePlan);

export default router;
