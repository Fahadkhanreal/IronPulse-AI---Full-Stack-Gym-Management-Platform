/**
 * Payment Gateway Interface
 * All payment gateways must implement this interface
 */

export interface CheckoutData {
  amount: number;
  currency: string;
  planId: string;
  userId: string;
  planTitle: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
  gateway: string;
  expiresAt?: Date;
}

export interface PaymentVerification {
  success: boolean;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed';
  gateway: string;
  metadata?: Record<string, any>;
}

export interface WebhookResult {
  success: boolean;
  event: string;
  paymentId?: string;
  status?: 'completed' | 'pending' | 'failed';
  data?: any;
}

/**
 * Payment Gateway Interface
 */
export interface PaymentGateway {
  /**
   * Create a checkout session
   */
  createCheckoutSession(data: CheckoutData): Promise<CheckoutResponse>;

  /**
   * Verify a payment
   */
  verifyPayment(sessionId: string, data?: any): Promise<PaymentVerification>;

  /**
   * Handle webhook events
   */
  handleWebhook(payload: any, signature?: string): Promise<WebhookResult>;

  /**
   * Get gateway name
   */
  getGatewayName(): string;
}
