/**
 * Unit tests for eFirmas integration module
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  generateDocumentHash,
  requestSignature,
  validateSignature,
  getTimeStamp,
  verifySignatureIntegrity,
  createLey81Metadata,
  formatSignatureBlock,
  type SignatureRequest,
} from "./efirmas-integration";

describe("eFirmas Integration", () => {
  describe("generateDocumentHash", () => {
    it("should generate consistent SHA-256 hash for same content", () => {
      const content = "Test document content";
      const hash1 = generateDocumentHash(content);
      const hash2 = generateDocumentHash(content);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it("should generate different hashes for different content", () => {
      const hash1 = generateDocumentHash("Content A");
      const hash2 = generateDocumentHash("Content B");

      expect(hash1).not.toBe(hash2);
    });

    it("should handle Buffer input", () => {
      const buffer = Buffer.from("Test content");
      const hash = generateDocumentHash(buffer);

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("requestSignature", () => {
    let signatureRequest: SignatureRequest;

    beforeEach(() => {
      signatureRequest = {
        documentId: "DOC-001",
        documentHash: generateDocumentHash("Test document"),
        documentName: "Contract.pdf",
        signerEmail: "juan@example.com",
        signerName: "Juan Pérez",
        signerCedula: "8-123-456",
        signatureType: "qualified",
        expiryDays: 7,
        message: "Please sign this contract",
      };
    });

    it("should create a signature request with valid response", async () => {
      const response = await requestSignature(signatureRequest);

      expect(response).toHaveProperty("signatureId");
      expect(response).toHaveProperty("certificateId");
      expect(response.status).toBe("pending");
      expect(response.signerEmail).toBe("juan@example.com");
      expect(response.signerName).toBe("Juan Pérez");
      expect(response.documentHash).toBe(signatureRequest.documentHash);
    });

    it("should generate unique signature IDs", async () => {
      const response1 = await requestSignature(signatureRequest);
      const response2 = await requestSignature(signatureRequest);

      expect(response1.signatureId).not.toBe(response2.signatureId);
    });

    it("should include audit trail entry", async () => {
      const response = await requestSignature(signatureRequest);

      expect(response.auditTrail).toHaveLength(1);
      expect(response.auditTrail[0].action).toBe("SIGNATURE_REQUESTED");
      expect(response.auditTrail[0].actor).toBe("system");
    });

    it("should handle all signature types", async () => {
      const types: Array<"simple" | "qualified" | "timestamped"> = [
        "simple",
        "qualified",
        "timestamped",
      ];

      for (const type of types) {
        const request = { ...signatureRequest, signatureType: type };
        const response = await requestSignature(request);
        expect(response.status).toBe("pending");
      }
    });
  });

  describe("validateSignature", () => {
    it("should validate a signature and return valid response", async () => {
      const signatureId = "SIG-001";
      const documentHash = generateDocumentHash("Test document");

      const response = await validateSignature(signatureId, documentHash);

      expect(response.isValid).toBe(true);
      expect(response.signatureId).toBe(signatureId);
      expect(response.certificateStatus).toBe("valid");
      expect(response.auditTrail).toHaveLength(2); // SIGNATURE_CREATED + SIGNATURE_VALIDATED
    });

    it("should include signer information in validation response", async () => {
      const response = await validateSignature("SIG-001", "hash123");

      expect(response).toHaveProperty("signerName");
      expect(response).toHaveProperty("signerEmail");
      expect(response).toHaveProperty("signedAt");
      expect(response).toHaveProperty("validatedAt");
    });

    it("should have valid audit trail entries", async () => {
      const response = await validateSignature("SIG-001", "hash123");

      expect(response.auditTrail).toHaveLength(2);
      expect(response.auditTrail[0].action).toBe("SIGNATURE_CREATED");
      expect(response.auditTrail[1].action).toBe("SIGNATURE_VALIDATED");
    });
  });

  describe("getTimeStamp", () => {
    it("should generate a timestamp token", async () => {
      const documentHash = generateDocumentHash("Test document");
      const token = await getTimeStamp(documentHash);

      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });

    it("should generate different tokens for different documents", async () => {
      const hash1 = generateDocumentHash("Document 1");
      const hash2 = generateDocumentHash("Document 2");

      const token1 = await getTimeStamp(hash1);
      const token2 = await getTimeStamp(hash2);

      expect(token1).not.toBe(token2);
    });

    it("should generate valid base64 encoded token", async () => {
      const token = await getTimeStamp("test-hash");

      // Try to decode - should not throw
      expect(() => Buffer.from(token, "base64").toString()).not.toThrow();
    });
  });

  describe("verifySignatureIntegrity", () => {
    it("should verify valid signature integrity", () => {
      const documentHash = "abc123def456";
      const signatureHash = "xyz789uvw012";

      const isValid = verifySignatureIntegrity(documentHash, documentHash, signatureHash);

      expect(isValid).toBe(true);
    });

    it("should detect document modification", () => {
      const originalHash = "abc123def456";
      const modifiedHash = "different789";
      const signatureHash = "xyz789uvw012";

      const isValid = verifySignatureIntegrity(originalHash, modifiedHash, signatureHash);

      expect(isValid).toBe(false);
    });
  });

  describe("createLey81Metadata", () => {
    it("should create compliant Ley 81 metadata", () => {
      const signature = {
        signatureId: "SIG-001",
        documentId: "DOC-001",
        status: "signed" as const,
        certificateId: "ANC-2026-001234",
        timestamp: new Date().toISOString(),
        signerEmail: "juan@example.com",
        signerName: "Juan Pérez",
        documentHash: "abc123",
        signatureHash: "xyz789",
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            action: "SIGNATURE_CREATED",
            actor: "signer",
            details: "Document signed",
          },
        ],
      };

      const metadata = createLey81Metadata(signature);

      expect(metadata).toHaveProperty("signatureId");
      expect(metadata).toHaveProperty("certificateId");
      expect(metadata).toHaveProperty("legalFramework");
      expect(metadata.legalFramework).toContain("Ley 81");
      expect(metadata.jurisdiction).toBe("Panama");
      expect(metadata.nonRepudiation).toBe(true);
      expect(metadata.timestamped).toBe(true);
    });

    it("should include complete audit trail", () => {
      const auditEntry = {
        timestamp: new Date().toISOString(),
        action: "TEST_ACTION",
        actor: "test-actor",
        details: "Test details",
      };

      const signature = {
        signatureId: "SIG-001",
        documentId: "DOC-001",
        status: "signed" as const,
        certificateId: "ANC-2026-001234",
        timestamp: new Date().toISOString(),
        signerEmail: "juan@example.com",
        signerName: "Juan Pérez",
        documentHash: "abc123",
        signatureHash: "xyz789",
        auditTrail: [auditEntry],
      };

      const metadata = createLey81Metadata(signature);

      expect(metadata.auditTrail).toHaveLength(1);
      expect(metadata.auditTrail[0]).toEqual(auditEntry);
    });
  });

  describe("formatSignatureBlock", () => {
    it("should format a legal signature block", () => {
      const validation = {
        isValid: true,
        signatureId: "SIG-001",
        certificateId: "ANC-2026-001234",
        signerName: "Juan Pérez",
        signerEmail: "juan@example.com",
        signedAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
        certificateStatus: "valid" as const,
        auditTrail: [],
      };

      const block = formatSignatureBlock(validation);

      expect(block).toContain("FIRMA ELECTRÓNICA CALIFICADA");
      expect(block).toContain("Juan Pérez");
      expect(block).toContain("juan@example.com");
      expect(block).toContain("Ley 81 de 2019");
      expect(block).toContain("No Repudio");
    });

    it("should include compliance checkmarks", () => {
      const validation = {
        isValid: true,
        signatureId: "SIG-001",
        certificateId: "ANC-2026-001234",
        signerName: "Test Signer",
        signerEmail: "test@example.com",
        signedAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
        certificateStatus: "valid" as const,
        auditTrail: [],
      };

      const block = formatSignatureBlock(validation);

      expect(block).toContain("✓ Ley 81 de 2019");
      expect(block).toContain("✓ Ley 51 de 2008");
      expect(block).toContain("✓ No Repudio");
      expect(block).toContain("✓ Integridad");
    });

    it("should display certificate status", () => {
      const validation = {
        isValid: true,
        signatureId: "SIG-001",
        certificateId: "ANC-2026-001234",
        signerName: "Test Signer",
        signerEmail: "test@example.com",
        signedAt: new Date().toISOString(),
        validatedAt: new Date().toISOString(),
        certificateStatus: "valid" as const,
        auditTrail: [],
      };

      const block = formatSignatureBlock(validation);

      expect(block).toContain("VALID");
    });
  });
});
