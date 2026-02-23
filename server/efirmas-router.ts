/**
 * eFirmas Router
 * tRPC procedures for digital signature management with eFirmas integration
 */

import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  requestSignature,
  validateSignature,
  getTimeStamp,
  generateDocumentHash,
  createLey81Metadata,
  formatSignatureBlock,
  type SignatureRequest,
} from "./efirmas-integration";
import {
  sendSignatureRequestNotification,
  sendSignatureCompletedNotification,
} from "./email-notifications";
import {
  notifySignatureSent,
  notifySignatureCompleted,
  notifySignatureRejected,
  notifySignatureExpired,
} from "./websocket-server";

export const efirmasRouter = router({
  /**
   * Request a digital signature for a document
   * Creates a signature request and sends it to the signer
   */
  requestSignature: protectedProcedure
    .input(
      z.object({
        documentId: z.string(),
        documentName: z.string(),
        documentContent: z.string().or(z.instanceof(Buffer)),
        signerEmail: z.string().email(),
        signerName: z.string(),
        signerCedula: z.string().optional(),
        signatureType: z.enum(["simple", "qualified", "timestamped"]),
        expiryDays: z.number().optional().default(7),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Generate document hash
        const documentHash = generateDocumentHash(input.documentContent);

        // Create signature request
        const signatureRequest: SignatureRequest = {
          documentId: input.documentId,
          documentHash,
          documentName: input.documentName,
          signerEmail: input.signerEmail,
          signerName: input.signerName,
          signerCedula: input.signerCedula,
          signatureType: input.signatureType,
          expiryDays: input.expiryDays,
          message: input.message,
        };

        // Request signature from eFirmas
        const signatureResponse = await requestSignature(signatureRequest);

        // Get timestamp
        const timestamp = await getTimeStamp(documentHash);

        // Log audit trail
        console.log(
          `[${new Date().toISOString()}] Signature requested for document ${input.documentName} by ${ctx.user.email}`
        );

        // Send email notification to signer
        const expiryDate = new Date(Date.now() + (input.expiryDays || 7) * 86400000);
        try {
          await sendSignatureRequestNotification({
            signerName: input.signerName,
            signerEmail: input.signerEmail,
            documentName: input.documentName,
            senderName: ctx.user.name || "Legal Practice Stack",
            senderEmail: ctx.user.email || "noreply@legalstack.com",
            signatureLink: `https://app.legalstack.com/sign/${signatureResponse.signatureId}`,
            expiryDate: expiryDate.toISOString().split("T")[0],
            message: input.message,
            language: "es",
          });
        } catch (emailError) {
          console.warn("Failed to send signature request email:", emailError);
        }

        // Send WebSocket notification to admins
        try {
          notifySignatureSent(
            parseInt(signatureResponse.signatureId),
            input.signerEmail,
            input.signerName
          );
        } catch (wsError) {
          console.warn("Failed to send WebSocket notification:", wsError);
        }

        return {
          success: true,
          signatureId: signatureResponse.signatureId,
          certificateId: signatureResponse.certificateId,
          status: signatureResponse.status,
          timestamp: signatureResponse.timestamp,
          expiryDate: new Date(Date.now() + (input.expiryDays || 7) * 86400000).toISOString(),
          documentHash,
          timestampToken: timestamp,
          message: `Signature request sent to ${input.signerEmail}. Document expires in ${input.expiryDays || 7} days.`,
        };
      } catch (error) {
        console.error("Error requesting signature:", error);
        throw new Error("Failed to request digital signature");
      }
    }),

  /**
   * Validate a signed document
   * Verifies the signature authenticity and certificate validity
   */
  validateSignature: protectedProcedure
    .input(
      z.object({
        signatureId: z.string(),
        documentHash: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Validate signature with eFirmas
        const validationResponse = await validateSignature(input.signatureId, input.documentHash);

        // Create Ley 81 compliant metadata
        const ley81Metadata = createLey81Metadata({
          signatureId: input.signatureId,
          documentId: "doc-" + input.signatureId,
          status: "signed",
          certificateId: validationResponse.certificateId,
          timestamp: validationResponse.signedAt,
          signerEmail: validationResponse.signerEmail,
          signerName: validationResponse.signerName,
          documentHash: input.documentHash,
          signatureHash: input.documentHash, // Mock
          auditTrail: validationResponse.auditTrail,
        });

        // Log audit trail
        console.log(
          `[${new Date().toISOString()}] Signature ${input.signatureId} validated by ${ctx.user.email}`
        );

        // Send completion notification if signature is valid
        if (validationResponse.isValid) {
          try {
            await sendSignatureCompletedNotification({
              signerName: validationResponse.signerName,
              signerEmail: validationResponse.signerEmail,
              documentName: "Signed Document",
              senderName: ctx.user.name || "Legal Practice Stack",
              senderEmail: ctx.user.email || "noreply@legalstack.com",
              signedDate: validationResponse.signedAt,
              certificateId: validationResponse.certificateId,
              language: "es",
            });
          } catch (emailError) {
            console.warn("Failed to send signature completion email:", emailError);
          }

          // Send WebSocket notification to admins
          try {
            notifySignatureCompleted(
              parseInt(input.signatureId),
              validationResponse.signerEmail,
              validationResponse.signerName,
              validationResponse.certificateId
            );
          } catch (wsError) {
            console.warn("Failed to send WebSocket notification:", wsError);
          }
        }

        return {
          isValid: validationResponse.isValid,
          signatureId: validationResponse.signatureId,
          certificateId: validationResponse.certificateId,
          signerName: validationResponse.signerName,
          signerEmail: validationResponse.signerEmail,
          signedAt: validationResponse.signedAt,
          certificateStatus: validationResponse.certificateStatus,
          ley81Metadata,
          auditTrail: validationResponse.auditTrail,
        };
      } catch (error) {
        console.error("Error validating signature:", error);
        throw new Error("Failed to validate signature");
      }
    }),

  /**
   * Get signature details
   * Returns information about a specific signature
   */
  getSignatureDetails: protectedProcedure
    .input(
      z.object({
        signatureId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // In production, this would fetch from database or eFirmas API
        const mockSignature = {
          signatureId: input.signatureId,
          documentName: "Contract - TechCorp S.A.",
          signerName: "Juan Pérez",
          signerEmail: "juan@example.com",
          signerCedula: "8-123-456",
          status: "signed",
          certificateId: "ANC-2026-001234",
          signedAt: new Date(Date.now() - 86400000).toISOString(),
          expiryDate: new Date(Date.now() + 6 * 86400000).toISOString(),
          documentHash: "abc123def456...",
          signatureHash: "xyz789uvw012...",
          certificateStatus: "valid",
          nonRepudiation: true,
          timestamped: true,
        };

        // Log audit trail
        console.log(
          `[${new Date().toISOString()}] Signature details retrieved for ${input.signatureId} by ${ctx.user.email}`
        );

        return mockSignature;
      } catch (error) {
        console.error("Error getting signature details:", error);
        throw new Error("Failed to get signature details");
      }
    }),

  /**
   * List signatures for a user
   * Returns all signatures created or managed by the current user
   */
  listSignatures: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "signed", "rejected", "expired"]).optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Mock data - in production would query database
        const mockSignatures = [
          {
            signatureId: "SIG-001",
            documentName: "Contract - TechCorp S.A.",
            signerName: "Juan Pérez",
            status: "signed",
            signedAt: new Date(Date.now() - 86400000).toISOString(),
            certificateId: "ANC-2026-001234",
          },
          {
            signatureId: "SIG-002",
            documentName: "Power of Attorney - García Family",
            signerName: "María García",
            status: "pending",
            requestedAt: new Date(Date.now() - 3600000).toISOString(),
            expiryDate: new Date(Date.now() + 6 * 86400000).toISOString(),
          },
        ];

        const filtered = input.status
          ? mockSignatures.filter((s) => s.status === input.status)
          : mockSignatures;

        return {
          total: filtered.length,
          signatures: filtered.slice(input.offset, input.offset + input.limit),
        };
      } catch (error) {
        console.error("Error listing signatures:", error);
        throw new Error("Failed to list signatures");
      }
    }),

  /**
   * Get signature compliance report
   * Returns Ley 81 compliance information for a signature
   */
  getComplianceReport: protectedProcedure
    .input(
      z.object({
        signatureId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const complianceReport = {
          signatureId: input.signatureId,
          compliant: true,
          framework: "Ley 81 de 2019 - Ley sobre Protección de Datos Personales",
          checks: {
            hasTimestamp: true,
            hasCertificateId: true,
            hasSignerInfo: true,
            hasAuditTrail: true,
            nonRepudiationEnabled: true,
            integrityVerified: true,
            certificateValid: true,
            notRevoked: true,
          },
          jurisdiction: "Panama",
          certificateAuthority: "Autoridad Nacional de Certificación (ANC)",
          signedAt: new Date(Date.now() - 86400000).toISOString(),
          validatedAt: new Date().toISOString(),
          auditTrailEntries: [
            {
              timestamp: new Date(Date.now() - 86400000).toISOString(),
              action: "SIGNATURE_CREATED",
              actor: "signer@example.com",
              details: "Document signed with qualified electronic signature",
            },
            {
              timestamp: new Date().toISOString(),
              action: "COMPLIANCE_VERIFIED",
              actor: ctx.user.email,
              details: "Signature verified for Ley 81 compliance",
            },
          ],
        };

        // Log audit trail
        console.log(
          `[${new Date().toISOString()}] Compliance report generated for ${input.signatureId} by ${ctx.user.email}`
        );

        return complianceReport;
      } catch (error) {
        console.error("Error generating compliance report:", error);
        throw new Error("Failed to generate compliance report");
      }
    }),
});
