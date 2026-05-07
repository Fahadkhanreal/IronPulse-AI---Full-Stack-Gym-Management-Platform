import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Lazy initialization - only create Stripe client when needed
let stripeInstance: any = null;

function getStripe(): any {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Please add it to your .env file.');
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-03-25' as any,
      typescript: true,
    });
  }

  return stripeInstance;
}

// Export a proxy that lazily initializes Stripe
const stripe = new Proxy({} as any, {
  get: (target, prop) => {
    const stripeClient = getStripe();
    return (stripeClient as any)[prop];
  },
});

export default stripe;

// Helper to check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!process.env.STRIPE_SECRET_KEY;
};
