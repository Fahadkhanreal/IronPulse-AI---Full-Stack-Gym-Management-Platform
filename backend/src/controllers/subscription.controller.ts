import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';

export const getUserSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user.userId },
      include: {
        plan: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            features: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(success('Subscriptions retrieved successfully', subscriptions));
  } catch (err) {
    next(err);
  }
};

export const getActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        plan: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            features: true,
          },
        },
      },
      orderBy: { endDate: 'desc' },
    });

    res.status(200).json(success('Active subscription retrieved successfully', activeSubscription));
  } catch (err) {
    next(err);
  }
};
