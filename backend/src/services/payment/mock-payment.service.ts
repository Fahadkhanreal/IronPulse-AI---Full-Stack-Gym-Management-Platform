import {
  PaymentGateway,
  CheckoutData,
  CheckoutResponse,
  PaymentVerification,
  WebhookResult,
} from './payment.interface';

/**
 * Mock Payment Service
 * Used for testing without real API keys
 * Simulates payment gateway behavior
 */
export class MockPaymentService implements PaymentGateway {
  getGatewayName(): string {
    return 'mock';
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutResponse> {
    // Generate mock session ID
    const mockSessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Mock checkout URL - redirects to our mock payment page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const checkoutUrl = `${frontendUrl}/payment/mock-checkout?session=${mockSessionId}&amount=${data.amount}&plan=${data.planTitle}`;

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      sessionId: mockSessionId,
      checkoutUrl,
      gateway: 'mock',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    };
  }

  async verifyPayment(sessionId: string, data?: any): Promise<PaymentVerification> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock verification - always returns success in test mode
    // In real scenario, this would verify with the payment gateway
    const mockTransactionId = `mock_txn_${Date.now()}`;

    return {
      success: true,
      transactionId: mockTransactionId,
      amount: data?.amount || 0,
      currency: data?.currency || 'PKR',
      status: 'completed',
      gateway: 'mock',
      metadata: {
        sessionId,
        verifiedAt: new Date().toISOString(),
        mockMode: true,
      },
    };
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    // Mock webhook handling
    // In test mode, we accept any webhook payload
    return {
      success: true,
      event: payload.event || 'payment.success',
      paymentId: payload.paymentId || `mock_payment_${Date.now()}`,
      status: 'completed',
      data: payload,
    };
  }

  /**
   * Simulate payment failure (for testing error scenarios)
   */
  async simulateFailure(sessionId: string): Promise<PaymentVerification> {
    return {
      success: false,
      transactionId: `mock_failed_${Date.now()}`,
      amount: 0,
      currency: 'PKR',
      status: 'failed',
      gateway: 'mock',
      metadata: {
        sessionId,
        error: 'Simulated payment failure',
        mockMode: true,
      },
    };
  }
}
