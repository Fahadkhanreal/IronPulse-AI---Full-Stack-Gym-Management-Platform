import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json(error('Authentication required', 'No user found'));
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json(error('Access denied', 'Admin privileges required'));
  }

  next();
};
