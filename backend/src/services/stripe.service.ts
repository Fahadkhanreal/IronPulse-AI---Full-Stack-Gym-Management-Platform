import stripe from '../utils/stripe';

export const stripeService = {
  /**
   * Create a Stripe Checkout Session for plan purchase
   */
  async createCheckoutSession(params: {
    priceId: string;
    userId: string;
    planId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<any> {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        userId: params.userId,
        planId: params.planId,
      },
    });

    return session;
  },

  /**
   * Retrieve a Checkout Session by ID
   */
  async retrieveSession(sessionId: string): Promise<any> {
    return await stripe.checkout.sessions.retrieve(sessionId);
  },

  /**
   * Validate that a Stripe Price ID exists and is active
   */
  async validatePriceId(priceId: string): Promise<any> {
    try {
      const price = await stripe.prices.retrieve(priceId);
      if (!price.active) {
        throw new Error('Price is not active');
      }
      return price;
    } catch (error) {
      throw new Error('Invalid Stripe Price ID');
    }
  },

  /**
   * Construct webhook event from request
   */
  constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
  ): any {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  },
};
