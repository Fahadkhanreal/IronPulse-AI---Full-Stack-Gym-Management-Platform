/**
 * Payment Gateway Configuration
 * Supports multiple payment gateways: Stripe, EasyPaisa, JazzCash
 */

export const paymentConfig = {
  // Global payment mode: 'test' | 'live'
  mode: process.env.PAYMENT_MODE || 'test',

  // Active payment gateway: 'stripe' | 'easypaisa' | 'jazzcash' | 'mock'
  activeGateway: process.env.PAYMENT_GATEWAY || 'mock',

  // Currency
  currency: process.env.PAYMENT_CURRENCY || 'PKR',

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'mock_stripe_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'mock_webhook_secret',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'mock_publishable_key',
    mode: process.env.STRIPE_MODE || 'test',
  },

  // EasyPaisa Configuration
  easypaisa: {
    storeId: process.env.EASYPAISA_STORE_ID || 'mock_store_id',
    merchantId: process.env.EASYPAISA_MERCHANT_ID || 'mock_merchant_id',
    hashKey: process.env.EASYPAISA_HASH_KEY || 'mock_hash_key',
    apiUrl: process.env.EASYPAISA_API_URL || 'https://sandbox.easypaisa.com.pk/easypay',
    mode: process.env.EASYPAISA_MODE || 'test',
  },

  // JazzCash Configuration
  jazzcash: {
    merchantId: process.env.JAZZCASH_MERCHANT_ID || 'mock_merchant_id',
    password: process.env.JAZZCASH_PASSWORD || 'mock_password',
    integritySalt: process.env.JAZZCASH_SALT || 'mock_integrity_salt',
    apiUrl: process.env.JAZZCASH_API_URL || 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction',
    returnUrl: process.env.JAZZCASH_RETURN_URL || 'http://localhost:4000/api/payment/jazzcash/callback',
    mode: process.env.JAZZCASH_MODE || 'test',
  },
};

/**
 * Check if payment system is in test mode
 */
export const isTestMode = (): boolean => {
  return paymentConfig.mode === 'test' || paymentConfig.activeGateway === 'mock';
};

/**
 * Get active gateway name
 */
export const getActiveGateway = (): string => {
  return paymentConfig.activeGateway;
};

/**
 * Check if a specific gateway is configured
 */
export const isGatewayConfigured = (gateway: string): boolean => {
  if (gateway === 'mock') return true;

  switch (gateway) {
    case 'stripe':
      return !!paymentConfig.stripe.secretKey && paymentConfig.stripe.secretKey !== 'mock_stripe_key';
    case 'easypaisa':
      return !!paymentConfig.easypaisa.merchantId && paymentConfig.easypaisa.merchantId !== 'mock_merchant_id';
    case 'jazzcash':
      return !!paymentConfig.jazzcash.merchantId && paymentConfig.jazzcash.merchantId !== 'mock_merchant_id';
    default:
      return false;
  }
};
