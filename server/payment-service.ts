/**
 * Payment Processing Service
 * Handles Stripe integration for invoice payments and billing
 * Supports Panamanian Balboa (B/.) currency
 */

export interface PaymentIntent {
  id: string;
  amount: number; // in cents
  currency: string;
  status: "pending" | "processing" | "succeeded" | "failed";
  clientSecret?: string;
  invoiceId: string;
  clientId: number;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "bank_transfer";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  clientId: number;
  createdAt: Date;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  error?: string;
  message?: string;
}

export interface RefundRequest {
  paymentIntentId: string;
  amount?: number; // if not provided, full refund
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

/**
 * Payment Service Class
 * Handles all payment processing through Stripe
 */
export class PaymentService {
  private static instance: PaymentService;

  private constructor() {
    // Initialize Stripe (would be done with actual API key in production)
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Create a payment intent for an invoice
   * Supports Panamanian Balboa (B/.) currency
   */
  async createPaymentIntent(
    invoiceId: string,
    clientId: number,
    amountInCents: number,
    clientEmail: string,
    invoiceNumber: string
  ): Promise<PaymentResult> {
    try {
      console.log("[Payment] Creating payment intent", {
        invoiceId,
        clientId,
        amountInCents,
        clientEmail,
        invoiceNumber,
      });

      // TODO: In production, integrate with Stripe API
      // const paymentIntent = await stripe.paymentIntents.create({
      //   amount: amountInCents,
      //   currency: 'usd', // Stripe uses USD for Panama
      //   payment_method_types: ['card'],
      //   receipt_email: clientEmail,
      //   metadata: {
      //     invoiceId,
      //     invoiceNumber,
      //     clientId: clientId.toString(),
      //   },
      // });

      // Mock implementation
      const mockPaymentIntentId = `pi_${Date.now()}`;
      const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(7)}`;

      return {
        success: true,
        paymentIntentId: mockPaymentIntentId,
        clientSecret: mockClientSecret,
        message: "Payment intent created successfully",
      };
    } catch (error) {
      console.error("[Payment] Failed to create payment intent:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment intent",
      };
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
    try {
      console.log("[Payment] Confirming payment", { paymentIntentId });

      // TODO: In production, integrate with Stripe API
      // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      // if (paymentIntent.status === 'succeeded') {
      //   return { success: true, message: 'Payment confirmed' };
      // }

      // Mock implementation
      return {
        success: true,
        paymentIntentId,
        message: "Payment confirmed successfully",
      };
    } catch (error) {
      console.error("[Payment] Failed to confirm payment:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to confirm payment",
      };
    }
  }

  /**
   * Get payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<{ status: string; error?: string }> {
    try {
      console.log("[Payment] Getting payment status", { paymentIntentId });

      // TODO: In production, integrate with Stripe API
      // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      // return { status: paymentIntent.status };

      // Mock implementation
      return { status: "succeeded" };
    } catch (error) {
      console.error("[Payment] Failed to get payment status:", error);
      return {
        status: "unknown",
        error: error instanceof Error ? error.message : "Failed to get payment status",
      };
    }
  }

  /**
   * Create a payment method (card or bank transfer)
   */
  async createPaymentMethod(
    clientId: number,
    type: "card" | "bank_transfer",
    details: Record<string, unknown>
  ): Promise<{ success: boolean; paymentMethodId?: string; error?: string }> {
    try {
      console.log("[Payment] Creating payment method", {
        clientId,
        type,
      });

      // TODO: In production, integrate with Stripe API
      // const paymentMethod = await stripe.paymentMethods.create({
      //   type: type === 'card' ? 'card' : 'us_bank_account',
      //   ...details,
      // });

      // Mock implementation
      const mockPaymentMethodId = `pm_${Date.now()}`;

      return {
        success: true,
        paymentMethodId: mockPaymentMethodId,
      };
    } catch (error) {
      console.error("[Payment] Failed to create payment method:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create payment method",
      };
    }
  }

  /**
   * List payment methods for a client
   */
  async listPaymentMethods(clientId: number): Promise<{ success: boolean; methods?: PaymentMethod[]; error?: string }> {
    try {
      console.log("[Payment] Listing payment methods", { clientId });

      // TODO: In production, query from database and Stripe
      // const methods = await db.paymentMethods.findMany({
      //   where: { clientId },
      // });

      // Mock implementation
      return {
        success: true,
        methods: [],
      };
    } catch (error) {
      console.error("[Payment] Failed to list payment methods:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list payment methods",
      };
    }
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("[Payment] Deleting payment method", { paymentMethodId });

      // TODO: In production, integrate with Stripe API
      // await stripe.paymentMethods.detach(paymentMethodId);

      // Mock implementation
      return { success: true };
    } catch (error) {
      console.error("[Payment] Failed to delete payment method:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete payment method",
      };
    }
  }

  /**
   * Process a refund
   */
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      console.log("[Payment] Processing refund", request);

      // TODO: In production, integrate with Stripe API
      // const refund = await stripe.refunds.create({
      //   payment_intent: request.paymentIntentId,
      //   amount: request.amount,
      //   reason: request.reason || 'requested_by_customer',
      // });

      // Mock implementation
      const mockRefundId = `re_${Date.now()}`;

      return {
        success: true,
        refundId: mockRefundId,
        amount: request.amount,
      };
    } catch (error) {
      console.error("[Payment] Failed to process refund:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to process refund",
      };
    }
  }

  /**
   * Setup recurring billing for retainers
   */
  async setupRecurringBilling(
    clientId: number,
    paymentMethodId: string,
    amountInCents: number,
    billingCycle: "monthly" | "quarterly" | "annually"
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      console.log("[Payment] Setting up recurring billing", {
        clientId,
        billingCycle,
        amountInCents,
      });

      // TODO: In production, integrate with Stripe API
      // const subscription = await stripe.subscriptions.create({
      //   customer: customerId,
      //   items: [
      //     {
      //       price_data: {
      //         currency: 'usd',
      //         product_data: { name: 'Legal Services Retainer' },
      //         recurring: { interval: billingCycle === 'monthly' ? 'month' : ... },
      //         unit_amount: amountInCents,
      //       },
      //     },
      //   ],
      //   default_payment_method: paymentMethodId,
      // });

      // Mock implementation
      const mockSubscriptionId = `sub_${Date.now()}`;

      return {
        success: true,
        subscriptionId: mockSubscriptionId,
      };
    } catch (error) {
      console.error("[Payment] Failed to setup recurring billing:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to setup recurring billing",
      };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("[Payment] Canceling subscription", { subscriptionId });

      // TODO: In production, integrate with Stripe API
      // await stripe.subscriptions.del(subscriptionId);

      // Mock implementation
      return { success: true };
    } catch (error) {
      console.error("[Payment] Failed to cancel subscription:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to cancel subscription",
      };
    }
  }

  /**
   * Get payment history for a client
   */
  async getPaymentHistory(clientId: number, limit: number = 10): Promise<{ success: boolean; payments?: PaymentIntent[]; error?: string }> {
    try {
      console.log("[Payment] Getting payment history", { clientId, limit });

      // TODO: In production, query from database
      // const payments = await db.paymentIntents.findMany({
      //   where: { clientId },
      //   orderBy: { createdAt: 'desc' },
      //   take: limit,
      // });

      // Mock implementation
      return {
        success: true,
        payments: [],
      };
    } catch (error) {
      console.error("[Payment] Failed to get payment history:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get payment history",
      };
    }
  }

  /**
   * Handle webhook events from Stripe
   */
  async handleWebhookEvent(event: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
    try {
      const eventType = event.type as string;
      console.log("[Payment] Handling webhook event", { eventType });

      // TODO: In production, handle various Stripe webhook events
      // switch (eventType) {
      //   case 'payment_intent.succeeded':
      //     // Update invoice as paid
      //     break;
      //   case 'payment_intent.payment_failed':
      //     // Send payment failed notification
      //     break;
      //   case 'charge.refunded':
      //     // Update invoice as refunded
      //     break;
      //   default:
      //     console.log('Unhandled event type:', eventType);
      // }

      return { success: true };
    } catch (error) {
      console.error("[Payment] Failed to handle webhook event:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to handle webhook event",
      };
    }
  }
}

export const paymentService = PaymentService.getInstance();
