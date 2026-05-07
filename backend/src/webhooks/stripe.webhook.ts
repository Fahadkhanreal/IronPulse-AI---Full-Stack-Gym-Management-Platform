import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/prisma';
import { stripeService } from '../services/stripe.service';
import { isStripeConfigured } from '../utils/stripe';

export const handleStripeWebhook = async (req: Request, res: Response) => {
  // Check if Stripe is configured
  if (!isStripeConfigured()) {
    console.error('Stripe webhook received but Stripe is not configured');
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook configuration error' });
  }

  let event: any;

  try {
    // Construct event from raw body and signature
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    event = stripeService.constructWebhookEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as any);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as any);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as any);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as any);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * Handle checkout.session.completed event
 * This is the primary event for confirming payment and creating booking
 */
async function handleCheckoutSessionCompleted(session: any) {
  console.log('Processing checkout.session.completed:', session.id);

  const { userId, planId } = session.metadata || {};

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  // Use transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Check if payment already processed (idempotency)
    const existingPayment = await tx.payment.findUnique({
      where: { stripePaymentId: session.id },
    });

    if (existingPayment && existingPayment.status === 'SUCCEEDED') {
      console.log('Payment already processed:', session.id);
      return;
    }

    // Update payment status to SUCCEEDED
    const payment = await tx.payment.update({
      where: { stripePaymentId: session.id },
      data: { status: 'SUCCEEDED' },
    });

    // Create confirmed booking
    const booking = await tx.booking.create({
      data: {
        userId,
        planId,
        paymentId: payment.id,
        bookingDate: new Date(), // Default to now, can be customized
        status: 'CONFIRMED',
      },
    });

    // Update user's Stripe customer ID if available
    if (session.customer && typeof session.customer === 'string') {
      await tx.user.update({
        where: { id: userId },
        data: { stripeCustomerId: session.customer },
      });
    }

    console.log('Payment confirmed and booking created:', {
      paymentId: payment.id,
      bookingId: booking.id,
    });
  });
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  console.log('Processing payment_intent.succeeded:', paymentIntent.id);
  // Additional handling if needed
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  console.log('Processing payment_intent.payment_failed:', paymentIntent.id);

  // Update payment status to FAILED if it exists
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });
  }
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(charge: any) {
  console.log('Processing charge.refunded:', charge.id);

  // Find payment by payment intent ID
  if (charge.payment_intent && typeof charge.payment_intent === 'string') {
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: charge.payment_intent },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'REFUNDED' },
      });
    }
  }
}
