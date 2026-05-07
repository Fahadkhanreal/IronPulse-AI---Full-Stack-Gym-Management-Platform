import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { CreateCheckoutSessionInput } from '../schemas/payment.schema';
import { PaymentGatewayFactory } from '../services/payment/payment.factory';
import { getActiveGateway, isTestMode } from '../config/payment.config';

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const { planId, successUrl, cancelUrl, gateway } = req.body as CreateCheckoutSessionInput & { gateway?: string };

    // Verify plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json(error('Plan not found', `No plan found with ID: ${planId}`));
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { email: true, name: true },
    });

    if (!user) {
      return res.status(404).json(error('User not found', 'User account not found'));
    }

    // Get payment gateway (use provided gateway or default)
    const selectedGateway = gateway || getActiveGateway();
    const paymentGateway = PaymentGatewayFactory.getGateway(selectedGateway);

    // Prepare checkout data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkoutData = {
      amount: plan.price,
      currency: process.env.PAYMENT_CURRENCY || 'PKR',
      planId: plan.id,
      userId: req.user.userId,
      planTitle: plan.title,
      userEmail: user.email,
      successUrl: successUrl || `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: cancelUrl || `${frontendUrl}/payment/cancel`,
    };

    // Create checkout session
    const session = await paymentGateway.createCheckoutSession(checkoutData);

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: req.user.userId,
        planId: plan.id,
        stripePaymentId: session.sessionId, // Using this field for all gateways
        amount: plan.price,
        currency: checkoutData.currency,
        status: 'PENDING',
      },
    });

    res.status(201).json(success('Checkout session created successfully', {
      sessionId: session.sessionId,
      url: session.checkoutUrl,
      gateway: session.gateway,
      testMode: isTestMode(),
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Verify payment after checkout
 */
export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, gateway } = req.query;

    if (!sessionId) {
      return res.status(400).json(error('Missing session ID', 'Session ID is required'));
    }

    // Get payment gateway
    const selectedGateway = (gateway as string) || getActiveGateway();
    const paymentGateway = PaymentGatewayFactory.getGateway(selectedGateway);

    // Verify payment
    const verification = await paymentGateway.verifyPayment(sessionId as string, req.query);

    if (!verification.success) {
      return res.status(400).json(error('Payment verification failed', verification.metadata?.error || 'Payment could not be verified'));
    }

    // Update payment record in database
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: sessionId as string },
      include: { plan: true },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: verification.status === 'completed' ? 'SUCCEEDED' : 'FAILED',
          stripePaymentId: verification.transactionId,
        },
      });

      // If payment successful, create subscription
      if (verification.status === 'completed') {
        try {
          // Calculate end date based on plan duration (in months)
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + payment.plan.duration);

          // Create subscription (membership only)
          await prisma.subscription.create({
            data: {
              userId: payment.userId,
              planId: payment.planId,
              startDate: new Date(),
              endDate,
              status: 'ACTIVE',
            },
          });

          // Create booking with CONFIRMED status
          await prisma.booking.create({
            data: {
              userId: payment.userId,
              planId: payment.planId,
              paymentId: payment.id,
              bookingDate: new Date(), // Today's date
              status: 'CONFIRMED',
            },
          });
        } catch (subscriptionError: any) {
          // Log error but don't fail the payment verification
          console.warn('Subscription/Booking creation failed:', subscriptionError.message);
        }
      }
    }

    res.status(200).json(success('Payment verified successfully', {
      verified: verification.success,
      transactionId: verification.transactionId,
      amount: verification.amount,
      status: verification.status,
      gateway: verification.gateway,
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Handle payment gateway callbacks (EasyPaisa, JazzCash)
 */
export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gateway = req.params.gateway as string;
    const callbackData = req.method === 'POST' ? req.body : req.query;

    // Get payment gateway
    const paymentGateway = PaymentGatewayFactory.getGateway(gateway);

    // Handle webhook/callback
    const result = await paymentGateway.handleWebhook(callbackData);

    if (result.success && result.paymentId) {
      // Update payment record
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: result.paymentId },
        include: { plan: true },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: result.status === 'completed' ? 'SUCCEEDED' : 'FAILED',
          },
        });

        // Create subscription if payment successful
        if (result.status === 'completed') {
          try {
            // Calculate end date based on plan duration (in months)
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + payment.plan.duration);

            // Create subscription (membership only)
            await prisma.subscription.create({
              data: {
                userId: payment.userId,
                planId: payment.planId,
                startDate: new Date(),
                endDate,
                status: 'ACTIVE',
              },
            });

            // Create booking with CONFIRMED status
            await prisma.booking.create({
              data: {
                userId: payment.userId,
                planId: payment.planId,
                paymentId: payment.id,
                bookingDate: new Date(), // Today's date
                status: 'CONFIRMED',
              },
            });
          } catch (subscriptionError: any) {
            // Log error but don't fail the callback
            console.warn('Subscription/Booking creation failed:', subscriptionError.message);
          }
        }

        // Redirect to success/failure page
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const redirectUrl = result.status === 'completed'
          ? `${frontendUrl}/payment/success?session_id=${result.paymentId}`
          : `${frontendUrl}/payment/cancel`;

        return res.redirect(redirectUrl);
      }
    }

    // If payment not found or failed, redirect to cancel page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/payment/cancel`);
  } catch (err) {
    next(err);
  }
};

/**
 * Get available payment gateways
 */
export const getAvailableGateways = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const gateways = PaymentGatewayFactory.getAvailableGateways();
    const activeGateway = getActiveGateway();

    res.status(200).json(success('Available payment gateways', {
      gateways,
      activeGateway,
      testMode: isTestMode(),
    }));
  } catch (err) {
    next(err);
  }
};
