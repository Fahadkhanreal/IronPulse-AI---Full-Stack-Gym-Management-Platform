import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

/**
 * Middleware to extract raw body for Stripe webhook signature verification
 * This must be applied BEFORE express.json() middleware
 */
export const webhookRawBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      (req as any).rawBody = data;
      next();
    });
  } else {
    next();
  }
};

/**
 * Verify Stripe webhook signature
 */
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json(error('Webhook error', 'Missing Stripe signature'));
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json(error('Configuration error', 'Webhook secret not configured'));
  }

  // Signature verification happens in the webhook handler
  // This middleware just validates the signature header exists
  next();
};
