import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { cache } from '../utils/cache';

/**
 * Get all testimonials (Public)
 */
export const getAllTestimonials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'testimonials:all';

    // Try to get from cache first
    const cachedTestimonials = cache.get(cacheKey);
    if (cachedTestimonials) {
      return res.status(200).json(success('Testimonials retrieved successfully (cached)', cachedTestimonials));
    }

    // If not in cache, fetch from database
    const testimonials = await prisma.testimonial.findMany({
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
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    res.status(200).json(success('Testimonial retrieved successfully', testimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Create testimonial (Admin only)
 */
export const createTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, text, rating, image, role } = req.body;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        text,
        rating: parseInt(rating),
        image,
        role: role || 'Member',
      },
    });

    // Invalidate cache when new testimonial is created
    cache.delete('testimonials:all');

    res.status(201).json(success('Testimonial created successfully', testimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Update testimonial (Admin only)
 */
export const updateTestimonial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, text, rating, image, role } = req.body;

    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return res.status(404).json(error('Testimonial not found', `No testimonial found with ID: ${id}`));
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        text,
        rating: parseInt(rating),
        image,
        role: role || 'Member',
      },
    });

    // Invalidate cache when testimonial is updated
    cache.delete('testimonials:all');

    res.status(200).json(success('Testimonial updated successfully', updatedTestimonial));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete testimonial (Admin only)
 */
export const deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
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

    // Invalidate cache when testimonial is deleted
    cache.delete('testimonials:all');

    res.status(200).json(success('Testimonial deleted successfully', { id }));
  } catch (err) {
    next(err);
  }
};
