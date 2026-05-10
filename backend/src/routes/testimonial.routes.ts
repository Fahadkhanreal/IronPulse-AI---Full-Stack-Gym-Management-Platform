import { Router } from 'express';
import {
  getAllTestimonials,
  getTestimonialById,
  createTestimonial,
  getMyTestimonials,
  updateMyTestimonial,
  deleteMyTestimonial,
  getAllTestimonialsAdmin,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonialAdmin,
} from '../controllers/testimonial.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTestimonialSchema, updateTestimonialSchema } from '../schemas/testimonial.schema';
import { publicApiRateLimit, adminRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Get all APPROVED testimonials (60 requests per minute per IP)
router.get('/', publicApiRateLimit, getAllTestimonials);
router.get('/:id', publicApiRateLimit, getTestimonialById);

// ==================== MEMBER ROUTES (Authenticated) ====================
// Members can submit, view, update, and delete their own testimonials
router.post('/', authenticate, validate(createTestimonialSchema), createTestimonial);
router.get('/my/testimonials', authenticate, getMyTestimonials);
router.put('/my/:id', authenticate, validate(updateTestimonialSchema), updateMyTestimonial);
router.delete('/my/:id', authenticate, deleteMyTestimonial);

// ==================== ADMIN ROUTES ====================
// Admin can view all, approve, reject, and delete any testimonial
router.get('/admin/all', adminRateLimit, authenticate, requireAdmin, getAllTestimonialsAdmin);
router.patch('/admin/:id/approve', adminRateLimit, authenticate, requireAdmin, approveTestimonial);
router.patch('/admin/:id/reject', adminRateLimit, authenticate, requireAdmin, rejectTestimonial);
router.delete('/admin/:id', adminRateLimit, authenticate, requireAdmin, deleteTestimonialAdmin);

export default router;
