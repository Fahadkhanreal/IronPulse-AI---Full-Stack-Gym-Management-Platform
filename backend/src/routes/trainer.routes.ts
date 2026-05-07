import { Router } from 'express';
import { getAllTrainers, getTrainerById, createTrainer, updateTrainer, deleteTrainer } from '../controllers/trainer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTrainerSchema, updateTrainerSchema } from '../schemas/trainer.schema';

const router = Router();

// Public routes
router.get('/', getAllTrainers);
router.get('/:id', getTrainerById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, validate(createTrainerSchema), createTrainer);
router.put('/:id', authenticate, requireAdmin, validate(updateTrainerSchema), updateTrainer);
router.delete('/:id', authenticate, requireAdmin, deleteTrainer);

export default router;
