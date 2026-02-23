/**
 * Signature Audit Service
 * Handles logging and tracking of all signature activities
 * Compliant with Panama's Ley 81 (2019)
 */

import { getDb } from "./db";
import {
  signatureRequests,
  signatureEvents,
  signatureCertificates,
  signatureComplianceRecords,
  signatureAuditReports,
  type InsertSignatureRequest,
  type InsertSignatureEvent,
  type InsertSignatureCertificate,
  type InsertSignatureComplianceRecord,
  type InsertSignatureAuditReport,
} from "../drizzle/signature-audit-schema";
import { eq, gte, lte, and, desc } from "drizzle-orm";

/**
 * Create a signature request record
 */
export async function createSignatureRequest(
  data: InsertSignatureRequest
): Promise<{ id: number; success: boolean }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db!.insert(signatureRequests).values(data);
    const id = (result as any).insertId as number;

    // Log the event
    await logSignatureEvent({
      signatureRequestId: id,
      eventType: "request_created",
      actorId: data.requesterId,
      actorEmail: undefined,
      details: JSON.stringify({
        signerEmail: data.signerEmail,
        signerName: data.signerName,
        signatureType: data.signatureType,
        expiryDate: data.expiryDate,
      }),
    });

    return { id, success: true };
  } catch (error) {
    console.error("Error creating signature request:", error);
    throw error;
  }
}

/**
 * Log a signature event
 */
export async function logSignatureEvent(
  data: InsertSignatureEvent
): Promise<{ id: number; success: boolean }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db!.insert(signatureEvents).values(data);
    const id = (result as any).insertId as number;
    return { id, success: true };
  } catch (error) {
    console.error("Error logging signature event:", error);
    throw error;
  }
}

/**
 * Update signature request status
 */
export async function updateSignatureRequestStatus(
  signatureRequestId: number,
  status: string,
  actorId?: number,
  details?: Record<string, unknown>
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    await db!
      .update(signatureRequests)
      .set({
        status: status as any,
        updatedAt: new Date(),
      })
      .where(eq(signatureRequests.id, signatureRequestId));

    // Log the event
    await logSignatureEvent({
      signatureRequestId,
      eventType: `signature_${status}` as any,
      actorId,
      details: details ? JSON.stringify(details) : undefined,
    });

    return true;
  } catch (error) {
    console.error("Error updating signature request status:", error);
    throw error;
  }
}

/**
 * Record signature completion
 */
export async function recordSignatureCompletion(
  signatureRequestId: number,
  certificateId: string,
  timestampToken: string,
  signatureHash: string,
  actorId?: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    // Update signature request
    await db!
      .update(signatureRequests)
      .set({
        status: "signed",
        signedDate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(signatureRequests.id, signatureRequestId));

    // Log the event
    await logSignatureEvent({
      signatureRequestId,
      eventType: "signature_completed",
      actorId,
      certificateId,
      timestampToken,
      signatureHash,
      details: JSON.stringify({
        completedAt: new Date().toISOString(),
        certificateId,
      }),
    });

    // Verify compliance
    await verifySignatureCompliance(signatureRequestId, certificateId);

    return true;
  } catch (error) {
    console.error("Error recording signature completion:", error);
    throw error;
  }
}

/**
 * Store certificate information
 */
export async function storeCertificate(
  data: InsertSignatureCertificate
): Promise<{ id: number; success: boolean }> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const result = await db!.insert(signatureCertificates).values(data);
    const id = (result as any).insertId as number;
    return { id, success: true };
  } catch (error) {
    console.error("Error storing certificate:", error);
    throw error;
  }
}

/**
 * Verify signature compliance with Ley 81
 */
export async function verifySignatureCompliance(
  signatureRequestId: number,
  certificateId: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    // Get signature request
    const sigReq = await db!
      .select()
      .from(signatureRequests)
      .where(eq(signatureRequests.id, signatureRequestId))
      .limit(1);

    if (!sigReq || sigReq.length === 0) {
      throw new Error("Signature request not found");
    }

    // Get certificate
    const cert = await db!
      .select()
      .from(signatureCertificates)
      .where(eq(signatureCertificates.certificateId, certificateId))
      .limit(1);

    if (!cert || cert.length === 0) {
      throw new Error("Certificate not found");
    }

    const certificate = cert[0];

    // Verify compliance
    const isLey81Compliant =
      certificate.status === "valid" && certificate.validTo > new Date();
    const nonRepudiationVerified = !!certificate.thumbprint;
    const certificateValid = certificate.status === "valid";
    const timestampValid = !!sigReq[0].signedDate;
    const documentIntegrityVerified = !!sigReq[0].documentHash;

    // Record compliance check
    await db!.insert(signatureComplianceRecords).values({
      signatureRequestId,
      ley81Compliant: isLey81Compliant ? 1 : 0,
      nonRepudiationVerified: nonRepudiationVerified ? 1 : 0,
      certificateValid: certificateValid ? 1 : 0,
      timestampValid: timestampValid ? 1 : 0,
      documentIntegrityVerified: documentIntegrityVerified ? 1 : 0,
      complianceNotes: `Ley 81 (2019) Compliance Check - ${isLey81Compliant ? "PASSED" : "FAILED"}`,
    });

    return isLey81Compliant;
  } catch (error) {
    console.error("Error verifying signature compliance:", error);
    throw error;
  }
}

/**
 * Get audit trail for a signature request
 */
export async function getSignatureAuditTrail(
  signatureRequestId: number
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const events = await db!
      .select()
      .from(signatureEvents)
      .where(eq(signatureEvents.signatureRequestId, signatureRequestId))
      .orderBy(desc(signatureEvents.createdAt));

    return events;
  } catch (error) {
    console.error("Error getting audit trail:", error);
    throw error;
  }
}

/**
 * Get all signature requests with filtering
 */
export async function getSignatureRequests(filters: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  signerEmail?: string;
  requesterId?: number;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    let query: any = db.select().from(signatureRequests);

    const conditions = [];

    if (filters.status) {
      conditions.push(eq(signatureRequests.status, filters.status as any));
    }

    if (filters.startDate) {
      conditions.push(gte(signatureRequests.createdAt, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(signatureRequests.createdAt, filters.endDate));
    }

    if (filters.signerEmail) {
      conditions.push(
        eq(signatureRequests.signerEmail, filters.signerEmail)
      );
    }

    if (filters.requesterId) {
      conditions.push(eq(signatureRequests.requesterId, filters.requesterId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(desc(signatureRequests.createdAt));

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    return query;
  } catch (error) {
    console.error("Error getting signature requests:", error);
    throw error;
  }
}

/**
 * Generate compliance report
 */
export async function generateComplianceReport(
  startDate: Date,
  endDate: Date
): Promise<InsertSignatureAuditReport> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    // Get all signature requests in date range
    const requests = await db!
      .select()
      .from(signatureRequests)
      .where(
        and(
          gte(signatureRequests.createdAt, startDate),
          lte(signatureRequests.createdAt, endDate)
        )
      );

    // Get compliance records
    const complianceRecords = await db
      .select()
      .from(signatureComplianceRecords)
      .where(
        and(
          gte(signatureComplianceRecords.createdAt, startDate),
          lte(signatureComplianceRecords.createdAt, endDate)
        )
      );

    // Calculate statistics
    const totalRequests = requests.length;
    const completedSignatures = requests.filter(
      (r: any) => r.status === "signed"
    ).length;
    const pendingSignatures = requests.filter(
      (r: any) => r.status === "pending" || r.status === "sent"
    ).length;
    const expiredSignatures = requests.filter(
      (r: any) => r.status === "expired"
    ).length;
    const rejectedSignatures = requests.filter(
      (r: any) => r.status === "rejected"
    ).length;

    const ley81CompliantCount = complianceRecords.filter(
      (r: any) => r.ley81Compliant === 1
    ).length;
    const compliancePercentage =
      totalRequests > 0
        ? (ley81CompliantCount / totalRequests) * 100
        : 0;

    // Calculate average signing time
    const signedRequests = requests.filter(
      (r: any) => r.signedDate && r.createdAt
    );
    let averageSigningTime = 0;
    if (signedRequests.length > 0) {
      const totalTime = signedRequests.reduce((sum: number, r: any) => {
        const time =
          (r.signedDate!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60); // in hours
        return sum + time;
      }, 0);
      averageSigningTime = totalTime / signedRequests.length;
    }

    const reportData = {
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalRequests,
        completedSignatures,
        pendingSignatures,
        expiredSignatures,
        rejectedSignatures,
        ley81CompliantCount,
      },
      metrics: {
        completionRate:
          totalRequests > 0 ? (completedSignatures / totalRequests) * 100 : 0,
        compliancePercentage,
        averageSigningTime: Math.round(averageSigningTime * 100) / 100,
      },
    };

    return {
      reportName: `Compliance Report - ${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
      reportType: "custom",
      startDate,
      endDate,
      totalRequests,
      completedSignatures,
      pendingSignatures,
      expiredSignatures,
      rejectedSignatures,
      ley81CompliantCount,
      averageSigningTime: averageSigningTime as any,
      compliancePercentage: compliancePercentage as any,
      reportData: JSON.stringify(reportData),
      generatedBy: 1, // Will be overridden by the caller
    };
  } catch (error) {
    console.error("Error generating compliance report:", error);
    throw error;
  }
}

/**
 * Get compliance statistics
 */
export async function getComplianceStatistics(
  startDate: Date,
  endDate: Date
): Promise<any> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const requests = await db!
      .select()
      .from(signatureRequests)
      .where(
        and(
          gte(signatureRequests.createdAt, startDate),
          lte(signatureRequests.createdAt, endDate)
        )
      );

    const complianceRecords = await db!
      .select()
      .from(signatureComplianceRecords)
      .where(
        and(
          gte(signatureComplianceRecords.createdAt, startDate),
          lte(signatureComplianceRecords.createdAt, endDate)
        )
      );

    const statusBreakdown = {
      pending: requests.filter((r: any) => r.status === "pending").length,
      sent: requests.filter((r: any) => r.status === "sent").length,
      viewed: requests.filter((r: any) => r.status === "viewed").length,
      signed: requests.filter((r: any) => r.status === "signed").length,
      rejected: requests.filter((r: any) => r.status === "rejected").length,
      expired: requests.filter((r: any) => r.status === "expired").length,
      cancelled: requests.filter((r: any) => r.status === "cancelled").length,
    };

    const complianceBreakdown = {
      ley81Compliant: complianceRecords.filter(
        (r: any) => r.ley81Compliant === 1
      ).length,
      nonRepudiationVerified: complianceRecords.filter(
        (r: any) => r.nonRepudiationVerified === 1
      ).length,
      certificateValid: complianceRecords.filter(
        (r: any) => r.certificateValid === 1
      ).length,
      timestampValid: complianceRecords.filter(
        (r: any) => r.timestampValid === 1
      ).length,
      documentIntegrityVerified: complianceRecords.filter(
        (r: any) => r.documentIntegrityVerified === 1
      ).length,
    };

    return {
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      totalRequests: requests.length,
      totalComplianceChecks: complianceRecords.length,
      statusBreakdown,
      complianceBreakdown,
      compliancePercentage:
        complianceRecords.length > 0
          ? (complianceBreakdown.ley81Compliant / complianceRecords.length) *
            100
          : 0,
    };
  } catch (error) {
    console.error("Error getting compliance statistics:", error);
    throw error;
  }
}

/**
 * Export audit trail to CSV format
 */
export async function exportAuditTrailToCSV(
  startDate: Date,
  endDate: Date
): Promise<string> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const requests = await db!
      .select()
      .from(signatureRequests)
      .where(
        and(
          gte(signatureRequests.createdAt, startDate),
          lte(signatureRequests.createdAt, endDate)
        )
      );

    const events = await db!
      .select()
      .from(signatureEvents)
      .where(
        and(
          gte(signatureEvents.createdAt, startDate),
          lte(signatureEvents.createdAt, endDate)
        )
      );

    // Create CSV header
    const csvHeader =
      "Request ID,Signer Email,Status,Created At,Signed At,Event Type,Actor Email,Event Created At\n";

    // Create CSV rows
    const csvRows = events
      .map((event: any) => {
        const request = requests.find(
          (r: any) => r.id === event.signatureRequestId
        );
        return [
          event.signatureRequestId,
          request?.signerEmail || "",
          request?.status || "",
          request?.createdAt?.toISOString() || "",
          request?.signedDate?.toISOString() || "",
          event.eventType,
          event.actorEmail || "",
          event.createdAt.toISOString(),
        ]
          .map((cell) => `"${cell}"`)
          .join(",");
      })
      .join("\n");

    return csvHeader + csvRows;
  } catch (error) {
    console.error("Error exporting audit trail:", error);
    throw error;
  }
}
