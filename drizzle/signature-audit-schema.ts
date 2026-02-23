/**
 * Signature Audit Trail Schema
 * Tracks all digital signature activities for compliance and auditing
 * Compliant with Panama's Ley 81 (2019)
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Signature requests table - tracks all signature requests
 */
export const signatureRequests = mysqlTable(
  "signatureRequests",
  {
    id: int("id").autoincrement().primaryKey(),
    documentId: int("documentId").notNull(), // Reference to documents table
    requesterId: int("requesterId").notNull().references(() => users.id), // User who requested the signature
    signerId: int("signerId").references(() => users.id), // User who will sign (if internal)
    signerEmail: varchar("signerEmail", { length: 320 }).notNull(),
    signerName: varchar("signerName", { length: 255 }).notNull(),
    signerCedula: varchar("signerCedula", { length: 20 }), // Panamanian ID
    documentHash: varchar("documentHash", { length: 256 }).notNull(), // SHA-256 hash
    signatureType: mysqlEnum("signatureType", [
      "simple",
      "qualified",
      "timestamped",
    ]).default("simple"),
    status: mysqlEnum("status", [
      "pending",
      "sent",
      "viewed",
      "signed",
      "rejected",
      "expired",
      "cancelled",
    ]).default("pending"),
    expiryDate: timestamp("expiryDate").notNull(),
    signedDate: timestamp("signedDate"),
    rejectionReason: text("rejectionReason"),
    message: text("message"), // Optional message from requester
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    documentIdIdx: index("documentIdIdx").on(table.documentId),
    requesterIdIdx: index("requesterIdIdx").on(table.requesterId),
    signerEmailIdx: index("signerEmailIdx").on(table.signerEmail),
    statusIdx: index("statusIdx").on(table.status),
    expiryDateIdx: index("expiryDateIdx").on(table.expiryDate),
  })
);

export type SignatureRequest = typeof signatureRequests.$inferSelect;
export type InsertSignatureRequest = typeof signatureRequests.$inferInsert;

/**
 * Signature events table - detailed audit trail of signature lifecycle
 */
export const signatureEvents = mysqlTable(
  "signatureEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    signatureRequestId: int("signatureRequestId")
      .notNull()
      .references(() => signatureRequests.id),
    eventType: mysqlEnum("eventType", [
      "request_created",
      "request_sent",
      "document_viewed",
      "signature_initiated",
      "signature_completed",
      "signature_rejected",
      "signature_expired",
      "signature_cancelled",
      "certificate_verified",
      "timestamp_generated",
      "audit_accessed",
    ]).notNull(),
    actorId: int("actorId").references(() => users.id), // User who triggered the event
    actorEmail: varchar("actorEmail", { length: 320 }),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    details: text("details"), // JSON with event-specific details
    certificateId: varchar("certificateId", { length: 255 }), // ANC certificate ID
    timestampToken: text("timestampToken"), // TSA timestamp
    signatureHash: varchar("signatureHash", { length: 256 }), // Signature hash
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    signatureRequestIdIdx: index("signatureRequestIdIdx").on(
      table.signatureRequestId
    ),
    eventTypeIdx: index("eventTypeIdx").on(table.eventType),
    actorIdIdx: index("actorIdIdx").on(table.actorId),
    createdAtIdx: index("createdAtIdx").on(table.createdAt),
  })
);

export type SignatureEvent = typeof signatureEvents.$inferSelect;
export type InsertSignatureEvent = typeof signatureEvents.$inferInsert;

/**
 * Signature certificates table - stores certificate information for verification
 */
export const signatureCertificates = mysqlTable(
  "signatureCertificates",
  {
    id: int("id").autoincrement().primaryKey(),
    signatureRequestId: int("signatureRequestId")
      .notNull()
      .references(() => signatureRequests.id),
    certificateId: varchar("certificateId", { length: 255 }).notNull().unique(),
    issuer: varchar("issuer", { length: 255 }).notNull(), // ANC (Autoridad Nacional de Certificación)
    subject: varchar("subject", { length: 255 }).notNull(),
    serialNumber: varchar("serialNumber", { length: 255 }).notNull(),
    thumbprint: varchar("thumbprint", { length: 256 }).notNull(),
    publicKey: text("publicKey"), // PEM format
    validFrom: timestamp("validFrom").notNull(),
    validTo: timestamp("validTo").notNull(),
    status: mysqlEnum("status", [
      "valid",
      "expired",
      "revoked",
      "suspended",
    ]).default("valid"),
    revocationDate: timestamp("revocationDate"),
    revocationReason: text("revocationReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    certificateIdIdx: index("certificateIdIdx").on(table.certificateId),
    signatureRequestIdIdx: index("sigReqIdIdx").on(table.signatureRequestId),
    statusIdx: index("certStatusIdx").on(table.status),
  })
);

export type SignatureCertificate = typeof signatureCertificates.$inferSelect;
export type InsertSignatureCertificate =
  typeof signatureCertificates.$inferInsert;

/**
 * Signature compliance records table - for regulatory reporting
 */
export const signatureComplianceRecords = mysqlTable(
  "signatureComplianceRecords",
  {
    id: int("id").autoincrement().primaryKey(),
    signatureRequestId: int("signatureRequestId")
      .notNull()
      .references(() => signatureRequests.id),
    complianceCheckDate: timestamp("complianceCheckDate").defaultNow(),
    ley81Compliant: int("ley81Compliant").notNull(), // boolean as int
    nonRepudiationVerified: int("nonRepudiationVerified").notNull(), // boolean as int
    certificateValid: int("certificateValid").notNull(), // boolean as int
    timestampValid: int("timestampValid").notNull(), // boolean as int
    documentIntegrityVerified: int("documentIntegrityVerified").notNull(), // boolean as int
    complianceNotes: text("complianceNotes"),
    auditedBy: int("auditedBy").references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    signatureRequestIdIdx: index("complianceSigReqIdx").on(
      table.signatureRequestId
    ),
    ley81CompliantIdx: index("ley81CompliantIdx").on(table.ley81Compliant),
    complianceCheckDateIdx: index("complianceCheckDateIdx").on(
      table.complianceCheckDate
    ),
  })
);

export type SignatureComplianceRecord =
  typeof signatureComplianceRecords.$inferSelect;
export type InsertSignatureComplianceRecord =
  typeof signatureComplianceRecords.$inferInsert;

/**
 * Signature audit reports table - for compliance reporting
 */
export const signatureAuditReports = mysqlTable(
  "signatureAuditReports",
  {
    id: int("id").autoincrement().primaryKey(),
    reportName: varchar("reportName", { length: 255 }).notNull(),
    reportType: mysqlEnum("reportType", [
      "daily",
      "weekly",
      "monthly",
      "quarterly",
      "annual",
      "custom",
    ]).default("custom"),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate").notNull(),
    totalRequests: int("totalRequests").notNull(),
    completedSignatures: int("completedSignatures").notNull(),
    pendingSignatures: int("pendingSignatures").notNull(),
    expiredSignatures: int("expiredSignatures").notNull(),
    rejectedSignatures: int("rejectedSignatures").notNull(),
    ley81CompliantCount: int("ley81CompliantCount").notNull(),
    averageSigningTime: decimal("averageSigningTime", { precision: 10, scale: 2 }), // in hours
    compliancePercentage: decimal("compliancePercentage", {
      precision: 5,
      scale: 2,
    }), // 0-100
    reportData: text("reportData"), // JSON with detailed statistics
    generatedBy: int("generatedBy").notNull().references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    reportTypeIdx: index("reportTypeIdx").on(table.reportType),
    startDateIdx: index("startDateIdx").on(table.startDate),
    endDateIdx: index("endDateIdx").on(table.endDate),
  })
);

export type SignatureAuditReport = typeof signatureAuditReports.$inferSelect;
export type InsertSignatureAuditReport =
  typeof signatureAuditReports.$inferInsert;
