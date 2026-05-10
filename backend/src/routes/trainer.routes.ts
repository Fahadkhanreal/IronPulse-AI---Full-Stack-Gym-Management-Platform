import { Router } from 'express';
import { getAllTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer } from '../controllers/trainer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTrainerSchema, updateTrainerSchema } from '../schemas/trainer.schema';
import { publicApiRateLimit, adminRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// Public routes (60 requests per minute per IP)
router.get('/', publicApiRateLimit, getAllTrainers);
router.get('/:id', publicApiRateLimit, getTrainerById);

// Admin-only routes (100 requests per minute)
router.post('/', adminRateLimit, authenticate, requireAdmin, validate(createTrainerSchema), createTrainer);
router.put('/:id', adminRateLimit, authenticate, requireAdmin, validate(updateTrainerSchema), updateTrainer);
router.delete('/:id', adminRateLimit, authenticate, requireAdmin, deleteTrainer);

export default router;
