import { Router } from 'express';
import { getAllTestimonials, getTestimonialById, createTestimonial, updateTestimonial, deleteTestimonial } from '../controllers/testimonial.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTestimonialSchema, updateTestimonialSchema } from '../schemas/testimonial.schema';

const router = Router();

// Public routes
router.get('/', getAllTestimonials);
router.get('/:id', getTestimonialById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, validate(createTestimonialSchema), createTestimonial);
router.put('/:id', authenticate, requireAdmin, validate(updateTestimonialSchema), updateTestimonial);
router.delete('/:id', authenticate, requireAdmin, deleteTestimonial);

export default router;
