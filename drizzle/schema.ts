import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "lawyer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Clients table - stores client information including Panamanian cédula
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cedula: varchar("cedula", { length: 20 }).unique(), // Panamanian ID
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Panama"),
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Cases table - stores case/matter information
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  assignedLawyerId: int("assignedLawyerId").references(() => users.id),
  caseNumber: varchar("caseNumber", { length: 50 }).unique().notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  caseType: varchar("caseType", { length: 100 }), // e.g., "Corporate", "Family", "Criminal"
  status: mysqlEnum("status", ["intake", "review", "active", "pending_signature", "closed", "archived"]).default("intake"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium"),
  openDate: timestamp("openDate").defaultNow().notNull(),
  closeDate: timestamp("closeDate"),
  budget: int("budget"), // in cents for Balboa currency
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

/**
 * Documents table - stores document metadata and references
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").references(() => cases.id),
  clientId: int("clientId").references(() => clients.id),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }), // e.g., "Contract", "Power of Attorney", "Pleading"
  storageKey: varchar("storageKey", { length: 500 }).notNull(), // S3 key
  storageUrl: text("storageUrl"), // S3 URL
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // in bytes
  status: mysqlEnum("status", ["draft", "pending_signature", "signed", "archived"]).default("draft"),
  isSigned: int("isSigned").default(0), // boolean as int
  signedBy: int("signedBy").references(() => users.id),
  signedAt: timestamp("signedAt"),
  signatureMetadata: text("signatureMetadata"), // JSON with signature details
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Time entries table - for billing and time tracking
 */
export const timeEntries = mysqlTable("timeEntries", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull().references(() => cases.id),
  lawyerId: int("lawyerId").notNull().references(() => users.id),
  description: text("description"),
  hours: int("hours"), // in minutes (e.g., 90 = 1.5 hours)
  hourlyRate: int("hourlyRate"), // in cents for Balboa
  totalAmount: int("totalAmount"), // in cents for Balboa
  billable: int("billable").default(1), // boolean as int
  entryDate: timestamp("entryDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = typeof timeEntries.$inferInsert;

/**
 * Invoices table - for billing
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull().references(() => cases.id),
  clientId: int("clientId").notNull().references(() => clients.id),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).unique().notNull(),
  amount: int("amount").notNull(), // in cents for Balboa
  currency: varchar("currency", { length: 3 }).default("PAB"), // Panamanian Balboa
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft"),
  issueDate: timestamp("issueDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  description: text("description"),
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Calendar events/appointments table
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").references(() => cases.id),
  clientId: int("clientId").references(() => clients.id),
  lawyerId: int("lawyerId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  type: varchar("type", { length: 100 }), // e.g., "Meeting", "Court Hearing", "Deposition"
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "rescheduled"]).default("scheduled"),
  notificationSent: int("notificationSent").default(0), // boolean as int
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Document templates table - for document automation
 */
export const documentTemplates = mysqlTable("documentTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Contracts", "Powers of Attorney"
  content: text("content"), // Template HTML/markdown with placeholders
  fields: text("fields"), // JSON array of field definitions
  isActive: int("isActive").default(1), // boolean as int
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = typeof documentTemplates.$inferInsert;

/**
 * Audit logs table - for compliance and tracking
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(), // e.g., "document_signed", "client_created"
  entityType: varchar("entityType", { length: 100 }), // e.g., "document", "client", "case"
  entityId: int("entityId"),
  details: text("details"), // JSON with additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Privacy consents table - for Ley 81 (2019) data protection compliance
 */
export const privacyConsents = mysqlTable("privacyConsents", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id),
  consentType: varchar("consentType", { length: 100 }).notNull(), // e.g., "data_processing", "marketing"
  consentGiven: int("consentGiven").notNull(), // boolean as int
  consentDate: timestamp("consentDate").defaultNow().notNull(),
  expiryDate: timestamp("expiryDate"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PrivacyConsent = typeof privacyConsents.$inferSelect;
export type InsertPrivacyConsent = typeof privacyConsents.$inferInsert;