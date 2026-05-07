import { Router } from 'express';
import { getAllPlans, getPlanById, createPlan, updatePlan, deletePlan } from '../controllers/plan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPlanSchema, updatePlanSchema } from '../schemas/plan.schema';

const router = Router();

// Public routes
router.get('/', getAllPlans);
router.get('/:id', getPlanById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, validate(createPlanSchema), createPlan);
router.put('/:id', authenticate, requireAdmin, validate(updatePlanSchema), updatePlan);
router.delete('/:id', authenticate, requireAdmin, deletePlan);

export default router;
