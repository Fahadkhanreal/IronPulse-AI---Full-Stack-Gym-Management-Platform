import { Request, Response, NextFunction } from 'express';
import { verify } from '../utils/jwt';
import { error } from '../utils/response';
import prisma from '../config/prisma';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(error('Authentication required', 'No token provided'));
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verify(token);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (!user) {
        return res.status(401).json(error('Authentication failed', 'User not found'));
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (err) {
      return res.status(401).json(error('Authentication failed', 'Invalid or expired token'));
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if valid token provided, but allows request to proceed without token
 * Used for endpoints that work for both authenticated and guest users
 */
export const authenticateOptional = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // No token provided - continue as guest
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verify(token);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true },
      });

      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
        };
      }

      next();
    } catch (err) {
      // Invalid token - continue as guest rather than rejecting
      next();
    }
  } catch (err) {
    next(err);
  }
};
