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
 * JazzCash Payment Service
 * Implements JazzCash payment gateway integration
 */
export class JazzCashService implements PaymentGateway {
  private config = paymentConfig.jazzcash;

  getGatewayName(): string {
    return 'jazzcash';
  }

  async createCheckoutSession(data: CheckoutData): Promise<CheckoutResponse> {
    // If in test mode, use mock service
    if (isTestMode()) {
      const mockService = new MockPaymentService();
      const mockResponse = await mockService.createCheckoutSession(data);
      return {
        ...mockResponse,
        gateway: 'jazzcash-test',
      };
    }

    // Real JazzCash API integration
    try {
      const transactionId = `T${Date.now()}`;
      const dateTime = this.getDateTime();
      const expiryDateTime = this.getExpiryDateTime();

      // Amount in paisa (multiply by 100)
      const amountInPaisa = Math.round(data.amount * 100);

      // Generate secure hash
      const secureHash = this.generateSecureHash({
        pp_Amount: amountInPaisa.toString(),
        pp_BillReference: data.planId,
        pp_Description: data.planTitle,
        pp_Language: 'EN',
        pp_MerchantID: this.config.merchantId,
        pp_Password: this.config.password,
        pp_ReturnURL: this.config.returnUrl,
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: dateTime,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_TxnRefNo: transactionId,
        pp_Version: '1.1',
      });

      // JazzCash API payload
      const payload = {
        pp_Version: '1.1',
        pp_TxnType: 'MWALLET', // Mobile Wallet
        pp_Language: 'EN',
        pp_MerchantID: this.config.merchantId,
        pp_SubMerchantID: '',
        pp_Password: this.config.password,
        pp_TxnRefNo: transactionId,
        pp_Amount: amountInPaisa.toString(),
        pp_TxnCurrency: 'PKR',
        pp_TxnDateTime: dateTime,
        pp_BillReference: data.planId,
        pp_Description: data.planTitle,
        pp_TxnExpiryDateTime: expiryDateTime,
        pp_ReturnURL: this.config.returnUrl,
        pp_SecureHash: secureHash,
        ppmpf_1: data.userId, // Custom field for user ID
        ppmpf_2: data.userEmail, // Custom field for email
      };

      // Call JazzCash API
      const response = await axios.post(this.config.apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      // JazzCash returns HTML form, we need to extract the payment URL
      // In production, you might need to parse the response differently
      const checkoutUrl = response.data.pp_PaymentURL || `${this.config.apiUrl}?token=${transactionId}`;

      return {
        sessionId: transactionId,
        checkoutUrl,
        gateway: 'jazzcash',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error: any) {
      console.error('JazzCash checkout error:', error.message);
      throw new Error(`JazzCash payment initialization failed: ${error.message}`);
    }
  }

  async verifyPayment(sessionId: string, data?: any): Promise<PaymentVerification> {
    // If in test mode, use mock service
    if (isTestMode()) {
      const mockService = new MockPaymentService();
      return mockService.verifyPayment(sessionId, data);
    }

    // Real JazzCash verification
    try {
      // Verify the secure hash from callback
      const isValid = this.verifySecureHash(data);

      if (!isValid) {
        return {
          success: false,
          transactionId: sessionId,
          amount: 0,
          currency: 'PKR',
          status: 'failed',
          gateway: 'jazzcash',
          metadata: { error: 'Invalid secure hash' },
        };
      }

      // Check response code
      const responseCode = data.pp_ResponseCode;
      const isSuccess = responseCode === '000'; // 000 = Success

      return {
        success: isSuccess,
        transactionId: data.pp_TxnRefNo || sessionId,
        amount: parseFloat(data.pp_Amount || '0') / 100, // Convert from paisa to rupees
        currency: 'PKR',
        status: isSuccess ? 'completed' : 'failed',
        gateway: 'jazzcash',
        metadata: {
          responseCode,
          responseMessage: data.pp_ResponseMessage,
          retrievalReferenceNo: data.pp_RetreivalReferenceNo,
        },
      };
    } catch (error: any) {
      console.error('JazzCash verification error:', error.message);
      return {
        success: false,
        transactionId: sessionId,
        amount: 0,
        currency: 'PKR',
        status: 'failed',
        gateway: 'jazzcash',
        metadata: { error: error.message },
      };
    }
  }

  async handleWebhook(payload: any, signature?: string): Promise<WebhookResult> {
    try {
      // Verify secure hash
      const isValid = this.verifySecureHash(payload);

      if (!isValid && !isTestMode()) {
        return {
          success: false,
          event: 'webhook.verification_failed',
        };
      }

      // Process webhook based on response code
      const status = payload.pp_ResponseCode === '000' ? 'completed' : 'failed';

      return {
        success: payload.pp_ResponseCode === '000',
        event: 'payment.callback',
        paymentId: payload.pp_TxnRefNo,
        status,
        data: payload,
      };
    } catch (error: any) {
      console.error('JazzCash webhook error:', error.message);
      return {
        success: false,
        event: 'webhook.error',
        data: { error: error.message },
      };
    }
  }

  /**
   * Generate DateTime for JazzCash (format: YYYYMMDDHHMMSS)
   */
  private getDateTime(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate Expiry DateTime (30 minutes from now)
   */
  private getExpiryDateTime(): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generate secure hash for JazzCash
   */
  private generateSecureHash(data: Record<string, string>): string {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();

    // Concatenate values with integrity salt
    let hashString = this.config.integritySalt;
    sortedKeys.forEach((key) => {
      hashString += `&${data[key]}`;
    });

    // Generate HMAC SHA256 hash
    return crypto.createHmac('sha256', this.config.integritySalt).update(hashString).digest('hex');
  }

  /**
   * Verify secure hash from callback
   */
  private verifySecureHash(data: any): boolean {
    if (isTestMode()) return true;

    try {
      const receivedHash = data.pp_SecureHash;
      const dataWithoutHash = { ...data };
      delete dataWithoutHash.pp_SecureHash;

      const calculatedHash = this.generateSecureHash(dataWithoutHash);

      return receivedHash === calculatedHash;
    } catch {
      return false;
    }
  }
}
