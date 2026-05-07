export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  stripePaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  plan?: {
    id: string;
    title: string;
    price: number;
  };
}

export interface CreateCheckoutRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  sessionId: string;
  url: string;
}
