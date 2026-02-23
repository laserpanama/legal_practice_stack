/**
 * Unit tests for email notification system
 */

import { describe, it, expect } from "vitest";
import {
  generateSignatureRequestEmail,
  generateSignatureCompletedEmail,
  generateSignatureExpirationEmail,
  sendEmailNotification,
  sendSignatureRequestNotification,
  sendSignatureCompletedNotification,
  sendSignatureExpirationNotification,
} from "./email-notifications";

describe("Email Notification System", () => {
  describe("generateSignatureRequestEmail", () => {
    it("should generate Spanish signature request email", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contrato de Servicios.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        message: "Por favor firme este contrato",
        language: "es",
      });

      expect(email.subject).toContain("Solicitud de Firma Digital");
      expect(email.htmlContent).toContain("Juan Pérez");
      expect(email.htmlContent).toContain("Contrato de Servicios.pdf");
      expect(email.htmlContent).toContain("Ley 81 de 2019");
      expect(email.textContent).toContain("Juan Pérez");
    });

    it("should generate English signature request email", () => {
      const email = generateSignatureRequestEmail({
        signerName: "John Smith",
        signerEmail: "john@example.com",
        documentName: "Service Agreement.pdf",
        senderName: "Jane Doe",
        senderEmail: "jane@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "en",
      });

      expect(email.subject).toContain("Digital Signature Request");
      expect(email.htmlContent).toContain("John Smith");
      expect(email.htmlContent).toContain("Service Agreement.pdf");
      expect(email.htmlContent).toContain("Law 81 of 2019");
      expect(email.textContent).toContain("John Smith");
    });

    it("should include optional message in email", () => {
      const message = "This is an important contract";
      const email = generateSignatureRequestEmail({
        signerName: "Test User",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        message,
        language: "en",
      });

      expect(email.htmlContent).toContain(message);
      expect(email.textContent).toContain(message);
    });

    it("should include company name if provided", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contract.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        senderCompany: "Legal Firm S.A.",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "es",
      });

      expect(email.htmlContent).toContain("Legal Firm S.A.");
      expect(email.textContent).toContain("Legal Firm S.A.");
    });
  });

  describe("generateSignatureCompletedEmail", () => {
    it("should generate Spanish signature completed email", () => {
      const email = generateSignatureCompletedEmail({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contrato de Servicios.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        signedDate: "2026-02-07",
        certificateId: "ANC-2026-001234",
        language: "es",
      });

      expect(email.subject).toContain("Documento Firmado");
      expect(email.htmlContent).toContain("María García");
      expect(email.htmlContent).toContain("Juan Pérez");
      expect(email.htmlContent).toContain("ANC-2026-001234");
      expect(email.htmlContent).toContain("2026-02-07");
      expect(email.textContent).toContain("Documento Firmado Exitosamente");
    });

    it("should generate English signature completed email", () => {
      const email = generateSignatureCompletedEmail({
        signerName: "John Smith",
        signerEmail: "john@example.com",
        documentName: "Service Agreement.pdf",
        senderName: "Jane Doe",
        senderEmail: "jane@example.com",
        signedDate: "2026-02-07",
        certificateId: "ANC-2026-001234",
        language: "en",
      });

      expect(email.subject).toContain("Document Signed");
      expect(email.htmlContent).toContain("Jane Doe");
      expect(email.htmlContent).toContain("John Smith");
      expect(email.htmlContent).toContain("ANC-2026-001234");
      expect(email.textContent).toContain("Document Successfully Signed");
    });

    it("should include Ley 81 compliance information", () => {
      const email = generateSignatureCompletedEmail({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contract.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        signedDate: "2026-02-07",
        certificateId: "ANC-2026-001234",
        language: "es",
      });

      expect(email.htmlContent).toContain("Ley 81 de 2019");
      expect(email.htmlContent).toContain("legalmente vinculante");
      expect(email.textContent).toContain("Ley 81 de 2019");
    });
  });

  describe("generateSignatureExpirationEmail", () => {
    it("should generate Spanish expiration warning email", () => {
      const email = generateSignatureExpirationEmail({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contrato de Servicios.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        expiryDate: "2026-02-14",
        signatureLink: "https://example.com/sign/123",
        language: "es",
      });

      expect(email.subject).toContain("Recordatorio");
      expect(email.subject).toContain("Firma Digital Próxima a Vencer");
      expect(email.htmlContent).toContain("Juan Pérez");
      expect(email.htmlContent).toContain("2026-02-14");
      expect(email.htmlContent).toContain("⏰");
      expect(email.textContent).toContain("IMPORTANTE");
    });

    it("should generate English expiration warning email", () => {
      const email = generateSignatureExpirationEmail({
        signerName: "John Smith",
        signerEmail: "john@example.com",
        documentName: "Service Agreement.pdf",
        senderName: "Jane Doe",
        senderEmail: "jane@example.com",
        expiryDate: "2026-02-14",
        signatureLink: "https://example.com/sign/123",
        language: "en",
      });

      expect(email.subject).toContain("Reminder");
      expect(email.subject).toContain("Expiring Soon");
      expect(email.htmlContent).toContain("John Smith");
      expect(email.htmlContent).toContain("2026-02-14");
      expect(email.textContent).toContain("IMPORTANT");
    });

    it("should include signature link in expiration email", () => {
      const link = "https://example.com/sign/123";
      const email = generateSignatureExpirationEmail({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contract.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        expiryDate: "2026-02-14",
        signatureLink: link,
        language: "es",
      });

      expect(email.htmlContent).toContain(link);
      expect(email.textContent).toContain(link);
    });
  });

  describe("Email template structure", () => {
    it("should have proper HTML structure with styling", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Test User",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "en",
      });

      expect(email.htmlContent).toContain("<!DOCTYPE html>");
      expect(email.htmlContent).toContain("<style>");
      expect(email.htmlContent).toContain("</style>");
      expect(email.htmlContent).toContain("<body>");
      expect(email.htmlContent).toContain("</body>");
    });

    it("should include professional styling", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Test User",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "en",
      });

      expect(email.htmlContent).toContain("font-family");
      expect(email.htmlContent).toContain("background");
      expect(email.htmlContent).toContain("color");
      expect(email.htmlContent).toContain("padding");
    });

    it("should include call-to-action button", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Test User",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "en",
      });

      expect(email.htmlContent).toContain("cta-button");
      expect(email.htmlContent).toContain("https://example.com/sign/123");
    });

    it("should include footer with copyright", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Test User",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "en",
      });

      expect(email.htmlContent).toContain("2026 Legal Practice Stack");
      expect(email.textContent).toContain("2026 Legal Practice Stack");
    });
  });

  describe("sendEmailNotification", () => {
    it("should return success response", async () => {
      const result = await sendEmailNotification(
        "test@example.com",
        "Test Subject",
        "<html>Test</html>",
        "Test"
      );

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.messageId).toMatch(/^msg-/);
    });

    it("should include message ID in response", async () => {
      const result = await sendEmailNotification(
        "test@example.com",
        "Test Subject",
        "<html>Test</html>",
        "Test"
      );

      expect(result.messageId).toMatch(/^msg-\d+-[a-z0-9]+$/);
    });
  });

  describe("sendSignatureRequestNotification", () => {
    it("should send signature request email", async () => {
      const result = await sendSignatureRequestNotification({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contract.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "es",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("sendSignatureCompletedNotification", () => {
    it("should send signature completed email", async () => {
      const result = await sendSignatureCompletedNotification({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contract.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        signedDate: "2026-02-07",
        certificateId: "ANC-2026-001234",
        language: "es",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("sendSignatureExpirationNotification", () => {
    it("should send expiration warning email", async () => {
      const result = await sendSignatureExpirationNotification({
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        documentName: "Contract.pdf",
        senderName: "María García",
        senderEmail: "maria@example.com",
        expiryDate: "2026-02-14",
        signatureLink: "https://example.com/sign/123",
        language: "es",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("Bilingual support", () => {
    it("should support Spanish language", () => {
      const emailEs = generateSignatureRequestEmail({
        signerName: "Test",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "es",
      });

      expect(emailEs.subject).toContain("Solicitud de Firma Digital");
      expect(emailEs.htmlContent).toContain("lang=\"es\"");
    });

    it("should support English language", () => {
      const emailEn = generateSignatureRequestEmail({
        signerName: "Test",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "en",
      });

      expect(emailEn.subject).toContain("Digital Signature Request");
      expect(emailEn.htmlContent).toContain("lang=\"en\"");
    });

    it("should default to Spanish if language not specified", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Test",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "es",
      });

      expect(email.subject).toContain("Solicitud");
    });
  });

  describe("Compliance and legal information", () => {
    it("should include Ley 81 compliance in all emails", () => {
      const request = generateSignatureRequestEmail({
        signerName: "Test",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "es",
      });

      const completed = generateSignatureCompletedEmail({
        signerName: "Test",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signedDate: "2026-02-07",
        certificateId: "ANC-2026-001234",
        language: "es",
      });

      expect(request.htmlContent).toContain("Ley 81");
      expect(completed.htmlContent).toContain("Ley 81");
    });

    it("should reference ANC (Autoridad Nacional de Certificación)", () => {
      const email = generateSignatureRequestEmail({
        signerName: "Test",
        signerEmail: "test@example.com",
        documentName: "Test.pdf",
        senderName: "Sender",
        senderEmail: "sender@example.com",
        signatureLink: "https://example.com/sign/123",
        expiryDate: "2026-02-14",
        language: "es",
      });

      expect(email.htmlContent).toContain("ANC");
      expect(email.textContent).toContain("ANC");
    });
  });
});
