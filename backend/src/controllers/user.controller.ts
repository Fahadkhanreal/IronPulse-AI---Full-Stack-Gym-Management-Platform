import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { UpdateProfileInput } from '../schemas/user.schema';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json(error('User not found', 'User account not found'));
    }

    res.status(200).json(success('Profile retrieved successfully', user));
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const updateData = req.body as UpdateProfileInput;

    // If email is being updated, check uniqueness
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== req.user.userId) {
        return res.status(400).json(error('Email already in use', 'This email is already registered to another account'));
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json(success('Profile updated successfully', updatedUser));
  } catch (err) {
    next(err);
  }
};
