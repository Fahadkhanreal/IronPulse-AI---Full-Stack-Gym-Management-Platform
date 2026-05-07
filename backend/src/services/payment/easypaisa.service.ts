import axios from 'axios';
import crypto from 'crypto';
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
 * EasyPaisa Payment Service
 * Implements EasyPaisa payment gateway integration
 */
export class EasypaisaService implements PaymentGateway {
  private config = paymentConfig.easypaisa;

  getGatewayName(): string {
    return 'easypaisa';
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutResponse> {
    // If in test mode, use mock service
    if (isTestMode()) {
      const mockService = new MockPaymentService();
      const mockResponse = await mockService.createCheckoutSession(data);
      return {
        ...mockResponse,
        gateway: 'easypaisa-test',
      };
    }

    // Real EasyPaisa API integration
    try {
      const orderId = `EP_${Date.now()}_${data.userId.substring(0, 8)}`;
      const expiryDate = this.getExpiryDate();

      // Generate hash for security
      const hashString = `${this.config.storeId}${data.amount}${orderId}${expiryDate}${this.config.hashKey}`;
      const secureHash = crypto.createHash('sha256').update(hashString).digest('hex');

      // EasyPaisa API payload
      const payload = {
        storeId: this.config.storeId,
        amount: data.amount,
        postBackURL: `${process.env.BACKEND_URL}/api/payment/easypaisa/callback`,
        orderRefNum: orderId,
        expiryDate,
        merchantHashedReq: secureHash,
        autoRedirect: '1',
        paymentMethod: 'MA_PAYMENT_METHOD', // Mobile Account
        emailAddress: data.userEmail,
        mobileNumber: '', // Customer will enter on EasyPaisa page
      };

      // Call EasyPaisa API
      const response = await axios.post(`${this.config.apiUrl}/Index.jsf`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data && response.data.token) {
        return {
          sessionId: response.data.token,
          checkoutUrl: `${this.config.apiUrl}/Confirm.jsf?token=${response.data.token}`,
          gateway: 'easypaisa',
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        };
      }

      throw new Error('Failed to create EasyPaisa checkout session');
    } catch (error: any) {
      console.error('EasyPaisa checkout error:', error.message);
      throw new Error(`EasyPaisa payment initialization failed: ${error.message}`);
    }
  }

  async verifyPayment(sessionId: string, data?: any): Promise<PaymentVerification> {
    // If in test mode, use mock service
    if (isTestMode()) {
      const mockService = new MockPaymentService();
      return mockService.verifyPayment(sessionId, data);
    }

    // Real EasyPaisa verification
    try {
      const orderId = data?.orderId || sessionId;

      // Generate inquiry hash
      const hashString = `${this.config.storeId}${orderId}${this.config.hashKey}`;
      const secureHash = crypto.createHash('sha256').update(hashString).digest('hex');

      // Inquiry API call
      const response = await axios.post(
        `${this.config.apiUrl}/Inquiry.jsf`,
        {
          storeId: this.config.storeId,
          orderRefNum: orderId,
          merchantHashedReq: secureHash,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );

      const result = response.data;

      return {
        success: result.responseCode === '0000',
        transactionId: result.transactionId || orderId,
        amount: parseFloat(result.transactionAmount || '0'),
        currency: 'PKR',
        status: result.responseCode === '0000' ? 'completed' : 'failed',
        gateway: 'easypaisa',
        metadata: {
          responseCode: result.responseCode,
          responseDesc: result.responseDesc,
          orderId,
        },
      };
    } catch (error: any) {
      console.error('EasyPaisa verification error:', error.message);
      return {
        success: false,
        transactionId: sessionId,
        amount: 0,
        currency: 'PKR',
        status: 'failed',
        gateway: 'easypaisa',
        metadata: { error: error.message },
      };
    }
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    try {
      // Verify webhook authenticity
      const isValid = this.verifyWebhookSignature(payload, signature);

      if (!isValid && !isTestMode()) {
        return {
          success: false,
          event: 'webhook.verification_failed',
        };
      }

      // Process webhook based on response code
      const status = payload.responseCode === '0000' ? 'completed' : 'failed';

      return {
        success: payload.responseCode === '0000',
        event: 'payment.callback',
        paymentId: payload.transactionId,
        status,
        data: payload,
      };
    } catch (error: any) {
      console.error('EasyPaisa webhook error:', error.message);
      return {
        success: false,
        event: 'webhook.error',
        data: { error: error.message },
      };
    }
  }

  /**
   * Generate expiry date for EasyPaisa (format: YYYYMMDD HHMMSS)
   */
  private getExpiryDate(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30); // 30 minutes expiry

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day} ${hours}${minutes}${seconds}`;
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(payload: any, signature?: string): boolean {
    if (isTestMode()) return true;

    try {
      const hashString = `${this.config.storeId}${payload.orderRefNum}${payload.transactionAmount}${payload.transactionId}${this.config.hashKey}`;
      const expectedHash = crypto.createHash('sha256').update(hashString).digest('hex');

      return signature === expectedHash;
    } catch {
      return false;
    }
  }
}
