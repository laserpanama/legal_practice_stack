/**
 * Email Notification Service
 * Handles all email communications for the Legal Practice Stack
 * Supports SendGrid and AWS SES backends
 */

import { ENV } from "./_core/env";

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: string;
}

/**
 * Email Templates for Legal Practice
 */
export const emailTemplates = {
  clientIntakeConfirmation: (clientName: string, caseNumber: string): EmailTemplate => ({
    subject: `Welcome to Legal Practice Stack - Intake Confirmation`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome, ${clientName}!</h2>
            
            <p>Thank you for choosing our legal services. Your client intake form has been successfully received and processed.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Case Information</h3>
              <p><strong>Case Number:</strong> ${caseNumber}</p>
              <p><strong>Status:</strong> Under Review</p>
              <p><strong>Next Steps:</strong> Our legal team will review your intake form and contact you within 2 business days.</p>
            </div>
            
            <p>If you have any questions or need to provide additional information, please reply to this email or contact us directly.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated message from Legal Practice Stack. Please do not reply with sensitive information.
            </p>
          </div>
        </body>
      </html>
    `,
    textContent: `
Welcome, ${clientName}!

Thank you for choosing our legal services. Your client intake form has been successfully received and processed.

Case Information:
Case Number: ${caseNumber}
Status: Under Review
Next Steps: Our legal team will review your intake form and contact you within 2 business days.

If you have any questions or need to provide additional information, please reply to this email or contact us directly.

---
This is an automated message from Legal Practice Stack. Please do not reply with sensitive information.
    `,
  }),

  appointmentReminder: (clientName: string, appointmentDate: string, appointmentTime: string, lawyerName: string): EmailTemplate => ({
    subject: `Appointment Reminder - ${appointmentDate} at ${appointmentTime}`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Appointment Reminder</h2>
            
            <p>Hello ${clientName},</p>
            
            <p>This is a reminder about your upcoming appointment with us.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Appointment Details</h3>
              <p><strong>Date:</strong> ${appointmentDate}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Attorney:</strong> ${lawyerName}</p>
            </div>
            
            <p><strong>Please arrive 10 minutes early.</strong> If you need to reschedule or cancel, please contact us as soon as possible.</p>
            
            <p style="margin-top: 30px;">
              <a href="https://legalpracticestack.com/reschedule" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reschedule Appointment</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated message from Legal Practice Stack.
            </p>
          </div>
        </body>
      </html>
    `,
    textContent: `
Appointment Reminder

Hello ${clientName},

This is a reminder about your upcoming appointment with us.

Appointment Details:
Date: ${appointmentDate}
Time: ${appointmentTime}
Attorney: ${lawyerName}

Please arrive 10 minutes early. If you need to reschedule or cancel, please contact us as soon as possible.

Reschedule: https://legalpracticestack.com/reschedule

---
This is an automated message from Legal Practice Stack.
    `,
  }),

  documentSigningRequest: (clientName: string, documentName: string, signingDeadline: string): EmailTemplate => ({
    subject: `Document Signing Request - ${documentName}`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Document Signing Request</h2>
            
            <p>Hello ${clientName},</p>
            
            <p>We have prepared a document that requires your electronic signature. Please review and sign it at your earliest convenience.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Document Details</h3>
              <p><strong>Document:</strong> ${documentName}</p>
              <p><strong>Signing Deadline:</strong> ${signingDeadline}</p>
              <p><strong>Compliance:</strong> All signatures comply with Panama's Ley 81 (2019)</p>
            </div>
            
            <p style="margin-top: 30px;">
              <a href="https://legalpracticestack.com/sign-document" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign Document Now</a>
            </p>
            
            <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
              Your signature will be digitally certified and timestamped for legal compliance.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated message from Legal Practice Stack. Please do not reply with sensitive information.
            </p>
          </div>
        </body>
      </html>
    `,
    textContent: `
Document Signing Request

Hello ${clientName},

We have prepared a document that requires your electronic signature. Please review and sign it at your earliest convenience.

Document Details:
Document: ${documentName}
Signing Deadline: ${signingDeadline}
Compliance: All signatures comply with Panama's Ley 81 (2019)

Sign Document: https://legalpracticestack.com/sign-document

Your signature will be digitally certified and timestamped for legal compliance.

---
This is an automated message from Legal Practice Stack. Please do not reply with sensitive information.
    `,
  }),

  invoiceNotification: (clientName: string, invoiceNumber: string, amount: string, dueDate: string): EmailTemplate => ({
    subject: `Invoice ${invoiceNumber} - Payment Due ${dueDate}`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Invoice Notification</h2>
            
            <p>Hello ${clientName},</p>
            
            <p>We have prepared an invoice for services rendered. Please review the details below.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Invoice Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Due:</strong> ${amount}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>
            </div>
            
            <p style="margin-top: 30px;">
              <a href="https://legalpracticestack.com/pay-invoice" style="background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Invoice Online</a>
            </p>
            
            <p style="margin-top: 20px;">You can also pay by bank transfer or check. Please contact us for payment options.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated message from Legal Practice Stack.
            </p>
          </div>
        </body>
      </html>
    `,
    textContent: `
Invoice Notification

Hello ${clientName},

We have prepared an invoice for services rendered. Please review the details below.

Invoice Details:
Invoice Number: ${invoiceNumber}
Amount Due: ${amount}
Due Date: ${dueDate}

Pay Invoice Online: https://legalpracticestack.com/pay-invoice

You can also pay by bank transfer or check. Please contact us for payment options.

---
This is an automated message from Legal Practice Stack.
    `,
  }),

  paymentConfirmation: (clientName: string, invoiceNumber: string, amount: string, paymentDate: string): EmailTemplate => ({
    subject: `Payment Confirmation - Invoice ${invoiceNumber}`,
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">Payment Confirmed</h2>
            
            <p>Hello ${clientName},</p>
            
            <p>Thank you for your payment. We have successfully received your payment.</p>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #10b981;">Payment Details</h3>
              <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p><strong>Amount Paid:</strong> ${amount}</p>
              <p><strong>Payment Date:</strong> ${paymentDate}</p>
              <p><strong>Status:</strong> ✓ Paid</p>
            </div>
            
            <p>A receipt has been attached to this email for your records.</p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated message from Legal Practice Stack.
            </p>
          </div>
        </body>
      </html>
    `,
    textContent: `
Payment Confirmed

Hello ${clientName},

Thank you for your payment. We have successfully received your payment.

Payment Details:
Invoice Number: ${invoiceNumber}
Amount Paid: ${amount}
Payment Date: ${paymentDate}
Status: ✓ Paid

A receipt has been attached to this email for your records.

---
This is an automated message from Legal Practice Stack.
    `,
  }),
};

/**
 * Email Service Class
 * Handles sending emails through configured backend
 */
export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email using configured backend (SendGrid or AWS SES)
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Normalize recipients
      const toRecipients = Array.isArray(options.to) ? options.to : [options.to];

      // Log email (for development/testing)
      console.log("[Email] Sending email", {
        to: toRecipients.map((r) => r.email),
        subject: options.subject,
      });

      // TODO: In production, integrate with actual email service (SendGrid, AWS SES, etc.)
      // For now, return success (mock implementation)
      // In development, emails are logged to console
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      };
    } catch (error) {
      console.error("[Email] Failed to send email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send client intake confirmation email
   */
  async sendClientIntakeConfirmation(
    clientEmail: string,
    clientName: string,
    caseNumber: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = emailTemplates.clientIntakeConfirmation(clientName, caseNumber);
    return this.sendEmail({
      to: { email: clientEmail, name: clientName },
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Send appointment reminder email
   */
  async sendAppointmentReminder(
    clientEmail: string,
    clientName: string,
    appointmentDate: string,
    appointmentTime: string,
    lawyerName: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = emailTemplates.appointmentReminder(clientName, appointmentDate, appointmentTime, lawyerName);
    return this.sendEmail({
      to: { email: clientEmail, name: clientName },
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Send document signing request email
   */
  async sendDocumentSigningRequest(
    clientEmail: string,
    clientName: string,
    documentName: string,
    signingDeadline: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = emailTemplates.documentSigningRequest(clientName, documentName, signingDeadline);
    return this.sendEmail({
      to: { email: clientEmail, name: clientName },
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Send invoice notification email
   */
  async sendInvoiceNotification(
    clientEmail: string,
    clientName: string,
    invoiceNumber: string,
    amount: string,
    dueDate: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = emailTemplates.invoiceNotification(clientName, invoiceNumber, amount, dueDate);
    return this.sendEmail({
      to: { email: clientEmail, name: clientName },
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(
    clientEmail: string,
    clientName: string,
    invoiceNumber: string,
    amount: string,
    paymentDate: string
  ): Promise<{ success: boolean; error?: string }> {
    const template = emailTemplates.paymentConfirmation(clientName, invoiceNumber, amount, paymentDate);
    return this.sendEmail({
      to: { email: clientEmail, name: clientName },
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }
}

export const emailService = EmailService.getInstance();
