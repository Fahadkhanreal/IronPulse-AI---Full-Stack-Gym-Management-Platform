import Stripe from 'stripe';
import { paymentConfig, isTestMode } from '../../config/payment.config';
import {
  PaymentGateway,
  CheckoutData,
  CheckoutResponse,
  PaymentVerification,
  WebhookResult,
} from './payment.interface';
import { MockPaymentService } from './mock-payment.service';

/**
 * Stripe Payment Service
 * Implements Stripe payment gateway integration
 */
export class StripePaymentService implements PaymentGateway {
  private stripe: any | null = null;

  constructor() {
    // Initialize Stripe only if configured
    if (paymentConfig.stripe.secretKey && paymentConfig.stripe.secretKey !== 'mock_stripe_key') {
      this.stripe = new Stripe(paymentConfig.stripe.secretKey, {
        apiVersion: '2026-03-25.dahlia',
      });
    }
  }

  getGatewayName(): string {
    return 'stripe';
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutResponse> {
    // If in test mode or Stripe not configured, use mock service
    if (isTestMode() || !this.stripe) {
      const mockService = new MockPaymentService();
      const mockResponse = await mockService.createCheckoutSession(data);
      return {
        ...mockResponse,
        gateway: 'stripe-test',
      };
    }

    try {
      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: data.planTitle,
                description: `Subscription to ${data.planTitle}`,
              },
              unit_amount: Math.round(data.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        customer_email: data.userEmail,
        metadata: {
          userId: data.userId,
          planId: data.planId,
        },
      });

      if (!session.url) {
        throw new Error('Stripe did not return a checkout URL');
      }

      return {
        sessionId: session.id,
        checkoutUrl: session.url,
        gateway: 'stripe',
        expiresAt: new Date(session.expires_at * 1000),
      };
    } catch (error: any) {
      console.error('Stripe checkout error:', error.message);
      throw new Error(`Stripe payment initialization failed: ${error.message}`);
    }
  }

  async verifyPayment(sessionId: string, data?: any): Promise<PaymentVerification> {
    // If in test mode or Stripe not configured, use mock service
    if (isTestMode() || !this.stripe) {
      const mockService = new MockPaymentService();
      return mockService.verifyPayment(sessionId, data);
    }

    try {
      // Retrieve the session from Stripe
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      const isSuccess = session.payment_status === 'paid';

      return {
        success: isSuccess,
        transactionId: session.payment_intent as string || sessionId,
        amount: (session.amount_total || 0) / 100, // Convert from cents
        currency: session.currency?.toUpperCase() || 'USD',
        status: isSuccess ? 'completed' : session.payment_status === 'unpaid' ? 'pending' : 'failed',
        gateway: 'stripe',
        metadata: {
          sessionId: session.id,
          customerEmail: session.customer_email,
          paymentStatus: session.payment_status,
        },
      };
    } catch (error: any) {
      console.error('Stripe verification error:', error.message);
      return {
        success: false,
        transactionId: sessionId,
        amount: 0,
        currency: 'USD',
        status: 'failed',
        gateway: 'stripe',
        metadata: { error: error.message },
      };
    }
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    if (!this.stripe) {
      return {
        success: false,
        event: 'webhook.not_configured',
      };
    }

    try {
      // Verify webhook signature
      const webhookSecret = paymentConfig.stripe.webhookSecret;

      let event: any;

      if (signature && webhookSecret && webhookSecret !== 'mock_webhook_secret') {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret
        );
      } else if (isTestMode()) {
        // In test mode, accept without verification
        event = JSON.parse(payload.toString());
      } else {
        throw new Error('Webhook signature verification required');
      }

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as any;
          return {
            success: true,
            event: 'payment.success',
            paymentId: session.payment_intent as string,
            status: 'completed',
            data: {
              sessionId: session.id,
              userId: session.metadata?.userId,
              planId: session.metadata?.planId,
              amount: (session.amount_total || 0) / 100,
            },
          };
        }

        case 'checkout.session.expired': {
          const session = event.data.object as any;
          return {
            success: false,
            event: 'payment.expired',
            paymentId: session.id,
            status: 'failed',
            data: session,
          };
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as any;
          return {
            success: false,
            event: 'payment.failed',
            paymentId: paymentIntent.id,
            status: 'failed',
            data: paymentIntent,
          };
        }

        default:
          return {
            success: true,
            event: event.type,
            data: event.data.object,
          };
      }
    } catch (error: any) {
      console.error('Stripe webhook error:', error.message);
      return {
        success: false,
        event: 'webhook.error',
        data: { error: error.message },
      };
    }
  }
}
