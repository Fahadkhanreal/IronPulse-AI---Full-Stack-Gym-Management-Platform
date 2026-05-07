import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { CreatePlanInput, UpdatePlanInput } from '../schemas/plan.schema';

export const getAllPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { createdAt: 'desc' },
    });

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
    const { title, price, duration, features } = req.body as CreatePlanInput;

    const plan = await prisma.plan.create({
      data: {
        title,
        price,
        duration,
        features,
      },
    });

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

    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: updateData,
    });

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

    res.status(200).json(success('Plan deleted successfully', { id }));
  } catch (err) {
    next(err);
  }
};
