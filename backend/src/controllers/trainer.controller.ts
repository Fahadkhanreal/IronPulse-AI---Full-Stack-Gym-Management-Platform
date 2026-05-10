import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { cache } from '../utils/cache';

/**
 * Get all trainers (Public)
 */
export const getAllTrainers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'trainers:all';

    // Try to get from cache first
    const cachedTrainers = cache.get(cacheKey);
    if (cachedTrainers) {
      return res.status(200).json(success('Trainers retrieved successfully (cached)', cachedTrainers));
    }

    // If not in cache, fetch from database
    const trainers = await prisma.trainer.findMany({
      orderBy: { experience: 'desc' },
    });

    // Store in cache for 5 minutes
    cache.set(cacheKey, trainers, 300);

    res.status(200).json(success('Trainers retrieved successfully', trainers));
  } catch (err) {
    next(err);
  }
};

/**
 * Get single trainer (Public)
 */
export const getTrainerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const trainer = await prisma.trainer.findUnique({
      where: { id },
    });

    if (!trainer) {
      return res.status(404).json(error('Trainer not found', `No trainer found with ID: ${id}`));
    }

    res.status(200).json(success('Trainer retrieved successfully', trainer));
  } catch (err) {
    next(err);
  }
};

/**
 * Create trainer (Admin only)
 */
export const createTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, specialization, experience, image, bio } = req.body;

    const trainer = await prisma.trainer.create({
      data: {
        name,
        specialization,
        experience: parseInt(experience),
        image,
        bio: bio || null,
      },
    });

    // Invalidate cache when new trainer is created
    cache.delete('trainers:all');

    res.status(201).json(success('Trainer created successfully', trainer));
  } catch (err) {
    next(err);
  }
};

/**
 * Update trainer (Admin only)
 */
export const updateTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, specialization, experience, image, bio } = req.body;

    const trainer = await prisma.trainer.findUnique({
      where: { id },
    });

    if (!trainer) {
      return res.status(404).json(error('Trainer not found', `No trainer found with ID: ${id}`));
    }

    const updatedTrainer = await prisma.trainer.update({
      where: { id },
      data: {
        name,
        specialization,
        experience: parseInt(experience),
        image,
        bio: bio || null,
      },
    });

    // Invalidate cache when trainer is updated
    cache.delete('trainers:all');

    res.status(200).json(success('Trainer updated successfully', updatedTrainer));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete trainer (Admin only)
 */
export const deleteTrainer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const trainer = await prisma.trainer.findUnique({
      where: { id },
    });

    if (!trainer) {
      return res.status(404).json(error('Trainer not found', `No trainer found with ID: ${id}`));
    }

    await prisma.trainer.delete({
      where: { id },
    });

    // Invalidate cache when trainer is deleted
    cache.delete('trainers:all');

    res.status(200).json(success('Trainer deleted successfully', { id }));
  } catch (err) {
    next(err);
  }
};
