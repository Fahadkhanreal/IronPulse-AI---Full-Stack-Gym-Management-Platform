import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { CreatePlanInput, UpdatePlanInput } from '../schemas/plan.schema';
import { cache } from '../utils/cache';

export const getAllPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'plans:all';

    // Try to get from cache first
    const cachedPlans = cache.get(cacheKey);
    if (cachedPlans) {
      return res.status(200).json(success('Plans retrieved successfully (cached)', cachedPlans));
    }

    // If not in cache, fetch from database
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Store in cache for 5 minutes (300 seconds)
    cache.set(cacheKey, plans, 300);

    res.status(200).json(success('Plans retrieved successfully', plans));
  } catch (err) {
    next(err);
  }
};

export const getPlanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      return res.status(404).json(error('Plan not found', `No plan found with ID: ${id}`));
    }

    res.status(200).json(success('Plan retrieved successfully', plan));
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, price, duration, features, stripePriceId } = req.body as CreatePlanInput & { stripePriceId?: string };

    const plan = await prisma.plan.create({
      data: {
        title,
        price,
        duration,
        features,
        // Convert empty string to null to avoid unique constraint issues
        stripePriceId: stripePriceId === '' ? null : stripePriceId,
      },
    });

    // Invalidate cache when new plan is created
    cache.delete('plans:all');

    res.status(201).json(success('Plan created successfully', plan));
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const updateData = req.body as UpdatePlanInput;

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return res.status(404).json(error('Plan not found', `No plan found with ID: ${id}`));
    }

    // Convert empty string stripePriceId to null to avoid unique constraint violation
    const dataToUpdate = {
      ...updateData,
      stripePriceId: updateData.stripePriceId === '' ? null : updateData.stripePriceId,
    };

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: dataToUpdate,
    });

    // Invalidate cache when plan is updated
    cache.delete('plans:all');

    res.status(200).json(success('Plan updated successfully', updatedPlan));
  } catch (err) {
    next(err);
  }
};

export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if plan exists
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return res.status(404).json(error('Plan not found', `No plan found with ID: ${id}`));
    }

    await prisma.plan.delete({
      where: { id },
    });

    // Invalidate cache when plan is deleted
    cache.delete('plans:all');

    res.status(200).json(success('Plan deleted successfully', { id }));
  } catch (err) {
    next(err);
  }
};
