import api from '@/lib/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
  gateway: string;
  testMode: boolean;
}

interface PaymentVerification {
  verified: boolean;
  transactionId: string;
  amount: number;
  status: string;
  gateway: string;
}

interface AvailableGateways {
  gateways: string[];
  activeGateway: string;
  testMode: boolean;
}

export const paymentService = {
  /**
   * Get available payment gateways
   */
  async getAvailableGateways(): Promise<AvailableGateways> {
    const response = await api.get<ApiResponse<AvailableGateways>>('/payments/gateways');
    // api interceptor already returns response.data, so response is the ApiResponse
    return (response as any).data;
  },

  /**
   * Create Checkout Session (supports all gateways)
   */
  async createCheckoutSession(
    planId: string,
    gateway?: string
  ): Promise<CheckoutResponse> {
    const response = await api.post<ApiResponse<CheckoutResponse>>(
      '/payments/create-checkout-session',
      {
        planId,
        gateway,
      }
    );
    // api interceptor already returns response.data, so response is the ApiResponse
    return (response as any).data;
  },

  /**
   * Verify payment after checkout
   */
  async verifyPayment(
    sessionId: string,
    gateway?: string
  ): Promise<PaymentVerification> {
    const response = await api.get<ApiResponse<PaymentVerification>>(
      '/payments/verify',
      {
        params: { sessionId, gateway },
      }
    );
    // api interceptor already returns response.data, so response is the ApiResponse
    return (response as any).data;
  },
};
