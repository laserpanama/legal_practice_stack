/**
 * Email notification procedures for eFirmas router
 * Integrates email notifications into the signature workflow
 */

import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  sendSignatureRequestNotification,
  sendSignatureCompletedNotification,
  sendSignatureExpirationNotification,
} from "./email-notifications";

/**
 * Email notification router procedures
 * These procedures handle sending email notifications for signature events
 */
export const efirmasNotificationRouter = router({
  /**
   * Send signature request notification email
   * Called after a signature request is created
   */
  sendSignatureRequestEmail: protectedProcedure
    .input(
      z.object({
        signerName: z.string().min(1, "Signer name is required"),
        signerEmail: z.string().email("Invalid signer email"),
        documentName: z.string().min(1, "Document name is required"),
        signatureLink: z.string().url("Invalid signature link"),
        expiryDate: z.string(),
        message: z.string().optional(),
        language: z.enum(["es", "en"]).default("es"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await sendSignatureRequestNotification({
          signerName: input.signerName,
          signerEmail: input.signerEmail,
          documentName: input.documentName,
          senderName: ctx.user.name || "Legal Practice Stack",
          senderEmail: ctx.user.email || "noreply@legalstack.com",
          signatureLink: input.signatureLink,
          expiryDate: input.expiryDate,
          message: input.message,
          language: input.language,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to send email");
        }

        return {
          success: true,
          messageId: result.messageId,
          message: `Signature request email sent to ${input.signerEmail}`,
        };
      } catch (error) {
        console.error("Error sending signature request email:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send email"
        );
      }
    }),

  /**
   * Send signature completed notification email
   * Called after a document has been signed
   */
  sendSignatureCompletedEmail: protectedProcedure
    .input(
      z.object({
        signerName: z.string().min(1, "Signer name is required"),
        signerEmail: z.string().email("Invalid signer email"),
        documentName: z.string().min(1, "Document name is required"),
        signedDate: z.string(),
        certificateId: z.string(),
        senderEmail: z.string().email().optional(),
        language: z.enum(["es", "en"]).default("es"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await sendSignatureCompletedNotification({
          signerName: input.signerName,
          signerEmail: input.signerEmail,
          documentName: input.documentName,
          senderName: ctx.user.name || "Legal Practice Stack",
          senderEmail: ctx.user.email || "noreply@legalstack.com",
          signedDate: input.signedDate,
          certificateId: input.certificateId,
          language: input.language,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to send email");
        }

        return {
          success: true,
          messageId: result.messageId,
          message: `Signature completion notification sent to ${input.senderEmail}`,
        };
      } catch (error) {
        console.error("Error sending signature completed email:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send email"
        );
      }
    }),

  /**
   * Send signature expiration warning email
   * Called when a signature request is about to expire
   */
  sendSignatureExpirationEmail: protectedProcedure
    .input(
      z.object({
        signerName: z.string().min(1, "Signer name is required"),
        signerEmail: z.string().email("Invalid signer email"),
        documentName: z.string().min(1, "Document name is required"),
        expiryDate: z.string(),
        signatureLink: z.string().url("Invalid signature link"),
        language: z.enum(["es", "en"]).default("es"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await sendSignatureExpirationNotification({
          signerName: input.signerName,
          signerEmail: input.signerEmail,
          documentName: input.documentName,
          senderName: ctx.user.name || "Legal Practice Stack",
          senderEmail: ctx.user.email || "noreply@legalstack.com",
          expiryDate: input.expiryDate,
          signatureLink: input.signatureLink,
          language: input.language,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to send email");
        }

        return {
          success: true,
          messageId: result.messageId,
          message: `Signature expiration warning sent to ${input.signerEmail}`,
        };
      } catch (error) {
        console.error("Error sending signature expiration email:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send email"
        );
      }
    }),

  /**
   * Send bulk signature request notifications
   * Useful for sending requests to multiple signers at once
   */
  sendBulkSignatureRequests: protectedProcedure
    .input(
      z.object({
        signers: z.array(
          z.object({
            signerName: z.string(),
            signerEmail: z.string().email(),
          })
        ),
        documentName: z.string(),
        signatureLink: z.string().url(),
        expiryDate: z.string(),
        message: z.string().optional(),
        language: z.enum(["es", "en"]).default("es"),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const results = [];

      for (const signer of input.signers) {
        try {
          const result = await sendSignatureRequestNotification({
            signerName: signer.signerName,
            signerEmail: signer.signerEmail,
            documentName: input.documentName,
            senderName: ctx.user.name || "Legal Practice Stack",
            senderEmail: ctx.user.email || "noreply@legalstack.com",
            signatureLink: input.signatureLink,
            expiryDate: input.expiryDate,
            message: input.message,
            language: input.language,
          });

          results.push({
            signerEmail: signer.signerEmail,
            success: result.success,
            messageId: result.messageId,
            error: result.error,
          });
        } catch (error) {
          results.push({
            signerEmail: signer.signerEmail,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      return {
        success: failureCount === 0,
        totalSent: input.signers.length,
        successCount,
        failureCount,
        results,
        message: `Sent ${successCount} emails successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
      };
    }),

  /**
   * Test email notification (for development/testing)
   * Sends a test email to verify the notification system is working
   */
  sendTestEmail: protectedProcedure
    .input(
      z.object({
        recipientEmail: z.string().email("Invalid recipient email"),
        language: z.enum(["es", "en"]).default("es"),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        const result = await sendSignatureRequestNotification({
          signerName: "Test Signer",
          signerEmail: input.recipientEmail,
          documentName: "Test Document.pdf",
          senderName: ctx.user.name || "Legal Practice Stack",
          senderEmail: ctx.user.email || "noreply@legalstack.com",
          signatureLink: "https://example.com/sign/test-123",
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          message: "This is a test email for the signature notification system.",
          language: input.language,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to send test email");
        }

        return {
          success: true,
          messageId: result.messageId,
          message: `Test email sent successfully to ${input.recipientEmail}`,
        };
      } catch (error) {
        console.error("Error sending test email:", error);
        throw new Error(
          error instanceof Error ? error.message : "Failed to send test email"
        );
      }
    }),
});
