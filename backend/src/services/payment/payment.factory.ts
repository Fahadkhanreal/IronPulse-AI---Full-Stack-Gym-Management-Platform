import { PaymentGateway } from './payment.interface';
import { MockPaymentService } from './mock-payment.service';
import { StripePaymentService } from './stripe-payment.service';
import { EasypaisaService } from './easypaisa.service';
import { JazzCashService } from './jazzcash.service';
import { paymentConfig, isTestMode, getActiveGateway } from '../../config/payment.config';

/**
 * Payment Gateway Factory
 * Returns the appropriate payment gateway based on configuration
 */
export class PaymentGatewayFactory {
  /**
   * Get payment gateway instance
   * @param gateway - Optional gateway name to override default
   * @returns PaymentGateway instance
   */
  static getGateway(gateway?: string): PaymentGateway {
    const selectedGateway = gateway || getActiveGateway();

    // If in test mode, always return mock service
    if (isTestMode()) {
      console.log('🧪 Using Mock Payment Service (Test Mode)');
      return new MockPaymentService();
    }

    // Return appropriate gateway based on selection
    switch (selectedGateway.toLowerCase()) {
      case 'stripe':
        console.log('💳 Using Stripe Payment Gateway');
        return new StripePaymentService();

      case 'easypaisa':
        console.log('📱 Using EasyPaisa Payment Gateway');
        return new EasypaisaService();

      case 'jazzcash':
        console.log('📱 Using JazzCash Payment Gateway');
        return new JazzCashService();

      case 'mock':
        console.log('🧪 Using Mock Payment Service');
        return new MockPaymentService();

      default:
        console.warn(`⚠️ Unknown gateway: ${selectedGateway}, falling back to Mock`);
        return new MockPaymentService();
    }
  }

  /**
   * Get all available gateways
   */
  static getAvailableGateways(): string[] {
    const gateways = ['mock'];

    // Check which gateways are configured
    if (paymentConfig.stripe.secretKey && paymentConfig.stripe.secretKey !== 'mock_stripe_key') {
      gateways.push('stripe');
    }

    if (
      paymentConfig.easypaisa.merchantId &&
      paymentConfig.easypaisa.merchantId !== 'mock_merchant_id'
    ) {
      gateways.push('easypaisa');
    }

    if (
      paymentConfig.jazzcash.merchantId &&
      paymentConfig.jazzcash.merchantId !== 'mock_merchant_id'
    ) {
      gateways.push('jazzcash');
    }

    return gateways;
  }

  /**
   * Check if a specific gateway is available
   */
  static isGatewayAvailable(gateway: string): boolean {
    return this.getAvailableGateways().includes(gateway.toLowerCase());
  }
}
