import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Admin-only routes
router.post('/image', authenticate, requireAdmin, upload.single('image'), uploadImage);
router.delete('/image', authenticate, requireAdmin, deleteImage);

export default router;
