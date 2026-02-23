import { describe, expect, it } from "vitest";
import { emailService, emailTemplates } from "./email-service";
import { paymentService } from "./payment-service";

describe("Email Service", () => {
  it("should generate client intake confirmation template", () => {
    const template = emailTemplates.clientIntakeConfirmation("Juan Pérez", "CASE-2025-001");
    expect(template.subject).toContain("Welcome");
    expect(template.htmlContent).toContain("Juan Pérez");
    expect(template.htmlContent).toContain("CASE-2025-001");
    expect(template.textContent).toContain("Juan Pérez");
  });

  it("should generate appointment reminder template", () => {
    const template = emailTemplates.appointmentReminder("María García", "2025-01-15", "2:00 PM", "Dr. López");
    expect(template.subject).toContain("Appointment Reminder");
    expect(template.htmlContent).toContain("2025-01-15");
    expect(template.htmlContent).toContain("2:00 PM");
    expect(template.htmlContent).toContain("Dr. López");
  });

  it("should generate document signing request template", () => {
    const template = emailTemplates.documentSigningRequest("Carlos Rodríguez", "Power of Attorney", "2025-01-20");
    expect(template.subject).toContain("Document Signing Request");
    expect(template.htmlContent).toContain("Power of Attorney");
    expect(template.htmlContent).toContain("Ley 81");
  });

  it("should generate invoice notification template", () => {
    const template = emailTemplates.invoiceNotification("Ana López", "INV-2025-001", "B/.1,500.00", "2025-01-31");
    expect(template.subject).toContain("INV-2025-001");
    expect(template.htmlContent).toContain("B/.1,500.00");
    expect(template.htmlContent).toContain("2025-01-31");
  });

  it("should generate payment confirmation template", () => {
    const template = emailTemplates.paymentConfirmation("Pedro Martínez", "INV-2025-002", "B/.2,000.00", "2025-01-15");
    expect(template.subject).toContain("Payment Confirmation");
    expect(template.htmlContent).toContain("✓ Paid");
    expect(template.htmlContent).toContain("B/.2,000.00");
  });

  it("should send client intake confirmation email", async () => {
    const result = await emailService.sendClientIntakeConfirmation("client@example.com", "Test Client", "CASE-2025-001");
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should send appointment reminder email", async () => {
    const result = await emailService.sendAppointmentReminder(
      "client@example.com",
      "Test Client",
      "2025-01-15",
      "2:00 PM",
      "Dr. Test"
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should send document signing request email", async () => {
    const result = await emailService.sendDocumentSigningRequest(
      "client@example.com",
      "Test Client",
      "Power of Attorney",
      "2025-01-20"
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should send invoice notification email", async () => {
    const result = await emailService.sendInvoiceNotification(
      "client@example.com",
      "Test Client",
      "INV-2025-001",
      "B/.1,500.00",
      "2025-01-31"
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it("should send payment confirmation email", async () => {
    const result = await emailService.sendPaymentConfirmation(
      "client@example.com",
      "Test Client",
      "INV-2025-001",
      "B/.1,500.00",
      "2025-01-15"
    );
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});

describe("Payment Service", () => {
  it("should create a payment intent", async () => {
    const result = await paymentService.createPaymentIntent("INV-2025-001", 1, 150000, "client@example.com", "INV-2025-001");
    expect(result.success).toBe(true);
    expect(result.paymentIntentId).toBeDefined();
    expect(result.clientSecret).toBeDefined();
  });

  it("should confirm a payment", async () => {
    const createResult = await paymentService.createPaymentIntent("INV-2025-002", 1, 200000, "client@example.com", "INV-2025-002");
    const confirmResult = await paymentService.confirmPayment(createResult.paymentIntentId!);
    expect(confirmResult.success).toBe(true);
  });

  it("should get payment status", async () => {
    const createResult = await paymentService.createPaymentIntent("INV-2025-003", 1, 250000, "client@example.com", "INV-2025-003");
    const statusResult = await paymentService.getPaymentStatus(createResult.paymentIntentId!);
    expect(statusResult.status).toBeDefined();
  });

  it("should create a payment method", async () => {
    const result = await paymentService.createPaymentMethod(1, "card", {
      card: {
        number: "4242424242424242",
        exp_month: 12,
        exp_year: 2025,
        cvc: "123",
      },
    });
    expect(result.success).toBe(true);
    expect(result.paymentMethodId).toBeDefined();
  });

  it("should list payment methods", async () => {
    const result = await paymentService.listPaymentMethods(1);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.methods)).toBe(true);
  });

  it("should delete a payment method", async () => {
    const createResult = await paymentService.createPaymentMethod(1, "card", {});
    const deleteResult = await paymentService.deletePaymentMethod(createResult.paymentMethodId!);
    expect(deleteResult.success).toBe(true);
  });

  it("should process a refund", async () => {
    const createResult = await paymentService.createPaymentIntent("INV-2025-004", 1, 300000, "client@example.com", "INV-2025-004");
    const refundResult = await paymentService.processRefund({
      paymentIntentId: createResult.paymentIntentId!,
      amount: 300000,
      reason: "requested_by_customer",
    });
    expect(refundResult.success).toBe(true);
    expect(refundResult.refundId).toBeDefined();
  });

  it("should setup recurring billing", async () => {
    const result = await paymentService.setupRecurringBilling(1, "pm_test", 150000, "monthly");
    expect(result.success).toBe(true);
    expect(result.subscriptionId).toBeDefined();
  });

  it("should cancel a subscription", async () => {
    const setupResult = await paymentService.setupRecurringBilling(1, "pm_test", 150000, "monthly");
    const cancelResult = await paymentService.cancelSubscription(setupResult.subscriptionId!);
    expect(cancelResult.success).toBe(true);
  });

  it("should get payment history", async () => {
    const result = await paymentService.getPaymentHistory(1, 10);
    expect(result.success).toBe(true);
    expect(Array.isArray(result.payments)).toBe(true);
  });

  it("should handle webhook events", async () => {
    const event = {
      type: "payment_intent.succeeded",
      data: {
        object: {
          id: "pi_test",
          status: "succeeded",
        },
      },
    };
    const result = await paymentService.handleWebhookEvent(event);
    expect(result.success).toBe(true);
  });
});
