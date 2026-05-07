import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { error } from '../utils/response';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(400).json(error('Validation failed', errorMessages));
      }
      next(err);
    }
  };
};
