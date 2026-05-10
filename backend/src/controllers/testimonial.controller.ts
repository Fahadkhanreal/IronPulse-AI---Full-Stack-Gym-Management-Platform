import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { cache } from '../utils/cache';

/**
 * Get all APPROVED testimonials (Public)
 * Only shows approved testimonials to public
 */
export const getAllTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'testimonials:approved';

    // Try to get from cache first
    const cachedTestimonials = cache.get(cacheKey);
    if (cachedTestimonials) {
      return res.status(200).json(success('Testimonials retrieved successfully (cached)', cachedTestimonials));
    }

    // Only fetch APPROVED testimonials for public display
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Store in cache for 5 minutes
    cache.set(cacheKey, testimonials, 300);

    res.status(200).json(success('Testimonials retrieved successfully', testimonials));
  } catch (err) {
    next(err);
  }
};

/**
 * Get single testimonial (Public)
 */
export const getTestimonialById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    // Only show if approved (for public access)
    if (testimonial.status !== 'APPROVED') {
      return res.status(403).json(error('Testimonial not available', 'This testimonial is not yet approved'));
    }

    res.status(200).json(success('Testimonial retrieved successfully', testimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Create testimonial (Member - Authenticated)
 * Members submit their own testimonials
 */
export const createTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text, rating, image } = req.body;
    const userId = (req as any).user.userId;

    // Check if user already has a pending or approved testimonial
    const existingTestimonial = await prisma.testimonial.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    if (existingTestimonial) {
      return res.status(400).json(
        error(
          'Testimonial already exists',
          existingTestimonial.status === 'PENDING'
            ? 'You already have a pending testimonial awaiting approval'
            : 'You have already submitted an approved testimonial'
        )
      );
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        userId,
        text,
        rating: rating || 5,
        image: image || null,
        status: 'PENDING', // Always starts as pending
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Clear cache
    cache.delete('testimonials:approved');
    cache.delete('testimonials:pending');

    res.status(201).json(success('Testimonial submitted successfully. It will be reviewed by admin.', testimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's own testimonials (Member - Authenticated)
 */
export const getMyTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;

    const testimonials = await prisma.testimonial.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(success('Your testimonials retrieved successfully', testimonials));
  } catch (err) {
    next(err);
  }
};

/**
 * Update own testimonial (Member - Authenticated)
 * Can only update if status is PENDING or REJECTED
 */
export const updateMyTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { text, rating, image } = req.body;
    const userId = (req as any).user.userId;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    // Check ownership
    if (testimonial.userId !== userId) {
      return res.status(403).json(error('Forbidden', 'You can only update your own testimonials'));
    }

    // Can't update approved testimonials
    if (testimonial.status === 'APPROVED') {
      return res.status(400).json(error('Cannot update', 'Approved testimonials cannot be edited'));
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        text: text || testimonial.text,
        rating: rating || testimonial.rating,
        image: image !== undefined ? image : testimonial.image,
        status: 'PENDING', // Reset to pending after edit
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Clear cache
    cache.delete('testimonials:approved');
    cache.delete('testimonials:pending');

    res.status(200).json(success('Testimonial updated successfully', updatedTestimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete own testimonial (Member - Authenticated)
 */
export const deleteMyTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req as any).user.userId;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    // Check ownership
    if (testimonial.userId !== userId) {
      return res.status(403).json(error('Forbidden', 'You can only delete your own testimonials'));
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    // Clear cache
    cache.delete('testimonials:approved');
    cache.delete('testimonials:pending');

    res.status(200).json(success('Testimonial deleted successfully', null));
  } catch (err) {
    next(err);
  }
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all testimonials with filters (Admin only)
 */
export const getAllTestimonialsAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status as string)) {
      where.status = status;
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(success('Testimonials retrieved successfully', testimonials));
  } catch (err) {
    next(err);
  }
};

/**
 * Approve testimonial (Admin only)
 */
export const approveTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const adminId = (req as any).user.userId;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Clear cache
    cache.delete('testimonials:approved');
    cache.delete('testimonials:pending');

    res.status(200).json(success('Testimonial approved successfully', updatedTestimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Reject testimonial (Admin only)
 */
export const rejectTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const adminId = (req as any).user.userId;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedAt: new Date(),
        reviewedBy: adminId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Clear cache
    cache.delete('testimonials:approved');
    cache.delete('testimonials:pending');

    res.status(200).json(success('Testimonial rejected successfully', updatedTestimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete testimonial (Admin only)
 */
export const deleteTestimonialAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    // Clear cache
    cache.delete('testimonials:approved');
    cache.delete('testimonials:pending');

    res.status(200).json(success('Testimonial deleted successfully', null));
  } catch (err) {
    next(err);
  }
};
