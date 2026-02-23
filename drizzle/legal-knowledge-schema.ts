/**
 * Legal Knowledge Base Schema
 * Database tables for Panamanian legal codes and document templates
 */

import {
  mysqlTable,
  varchar,
  text,
  int,
  timestamp,
  mysqlEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Legal Codes Table
 * Stores Panamanian legal codes, laws, and regulations
 */
export const legalCodes = mysqlTable(
  "legal_codes",
  {
    id: int("id").primaryKey().autoincrement(),
    codeType: mysqlEnum("code_type", [
      "labor_law",
      "civil_code",
      "commercial_code",
      "penal_code",
      "procedural_code",
      "constitutional_law",
      "administrative_law",
      "environmental_law",
      "family_law",
      "intellectual_property",
      "tax_law",
      "maritime_law",
      "other",
    ]).notNull(),
    codeNumber: varchar("code_number", { length: 50 }).notNull(), // e.g., "Ley 93", "Decreto 1"
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    fullText: text("full_text").notNull(), // Complete legal text
    effectiveDate: timestamp("effective_date"),
    lastModified: timestamp("last_modified"),
    repealed: int("repealed").default(0), // 1 if repealed/obsolete
    source: varchar("source", { length: 255 }), // Source reference
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    codeTypeIdx: index("idx_code_type").on(table.codeType),
    codeNumberIdx: index("idx_code_number").on(table.codeNumber),
    titleIdx: index("idx_title").on(table.title),
  })
);

/**
 * Legal Code Sections Table
 * Breaks down legal codes into searchable sections and articles
 */
export const legalCodeSections = mysqlTable(
  "legal_code_sections",
  {
    id: int("id").primaryKey().autoincrement(),
    codeId: int("code_id").notNull(),
    sectionNumber: varchar("section_number", { length: 50 }).notNull(), // e.g., "Article 1", "Section 2"
    sectionTitle: varchar("section_title", { length: 255 }),
    sectionText: text("section_text").notNull(),
    keywords: text("keywords"), // Comma-separated keywords for search
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    codeIdIdx: index("idx_code_id").on(table.codeId),
    sectionNumberIdx: index("idx_section_number").on(table.sectionNumber),
  })
);

/**
 * Document Templates Table
 * Stores reusable document templates for various legal documents
 */
export const documentTemplates = mysqlTable(
  "document_templates",
  {
    id: int("id").primaryKey().autoincrement(),
    templateName: varchar("template_name", { length: 255 }).notNull(),
    templateType: mysqlEnum("template_type", [
      "labor_contract",
      "employment_agreement",
      "termination_letter",
      "power_of_attorney",
      "notarial_power",
      "divorce_petition",
      "separation_agreement",
      "commercial_contract",
      "purchase_agreement",
      "lease_agreement",
      "loan_agreement",
      "promissory_note",
      "demand_letter",
      "complaint",
      "motion",
      "settlement_agreement",
      "nda",
      "partnership_agreement",
      "corporate_bylaws",
      "will",
      "trust_document",
      "other",
    ]).notNull(),
    description: text("description"),
    templateContent: text("template_content").notNull(), // Template with {{placeholders}}
    requiredFields: text("required_fields"), // JSON array of required fields
    optionalFields: text("optional_fields"), // JSON array of optional fields
    category: varchar("category", { length: 100 }), // e.g., "Labor", "Commercial", "Family"
    jurisdiction: varchar("jurisdiction", { length: 100 }).default("Panama"), // Legal jurisdiction
    language: mysqlEnum("language", ["es", "en"]).default("es"),
    version: int("version").default(1),
    isActive: int("is_active").default(1),
    createdBy: int("created_by"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    templateTypeIdx: index("idx_template_type").on(table.templateType),
    categoryIdx: index("idx_category").on(table.category),
    isActiveIdx: index("idx_is_active").on(table.isActive),
  })
);

/**
 * Template Field Definitions Table
 * Defines fields and their properties for document templates
 */
export const templateFields = mysqlTable(
  "template_fields",
  {
    id: int("id").primaryKey().autoincrement(),
    templateId: int("template_id").notNull(),
    fieldName: varchar("field_name", { length: 100 }).notNull(),
    fieldLabel: varchar("field_label", { length: 255 }).notNull(),
    fieldType: mysqlEnum("field_type", [
      "text",
      "textarea",
      "date",
      "email",
      "phone",
      "number",
      "select",
      "checkbox",
      "signature",
    ]).notNull(),
    fieldDescription: text("field_description"),
    isRequired: int("is_required").default(0),
    defaultValue: varchar("default_value", { length: 255 }),
    validationRules: text("validation_rules"), // JSON validation rules
    options: text("options"), // JSON array for select fields
    order: int("order").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    templateIdIdx: index("idx_template_id").on(table.templateId),
  })
);

/**
 * Generated Documents Table
 * Tracks documents generated from templates
 */
export const generatedDocuments = mysqlTable(
  "generated_documents",
  {
    id: int("id").primaryKey().autoincrement(),
    templateId: int("template_id").notNull(),
    userId: int("user_id").notNull(),
    documentName: varchar("document_name", { length: 255 }).notNull(),
    documentContent: text("document_content").notNull(),
    filledData: text("filled_data"), // JSON with filled field values
    status: mysqlEnum("status", [
      "draft",
      "review",
      "approved",
      "signed",
      "archived",
    ]).default("draft"),
    documentUrl: varchar("document_url", { length: 255 }), // S3 URL
    generatedAt: timestamp("generated_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    templateIdIdx: index("idx_template_id").on(table.templateId),
    userIdIdx: index("idx_user_id").on(table.userId),
    statusIdx: index("idx_status").on(table.status),
  })
);

/**
 * Legal Advice Log Table
 * Tracks AI-generated legal advice and document assistance
 */
export const legalAdviceLog = mysqlTable(
  "legal_advice_log",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull(),
    query: text("query").notNull(), // User's question/request
    response: text("response").notNull(), // AI-generated response
    citedCodes: text("cited_codes"), // JSON array of cited legal codes
    usedTemplates: text("used_templates"), // JSON array of used templates
    documentGenerated: int("document_generated").default(0), // 1 if document was generated
    generatedDocumentId: int("generated_document_id"),
    confidence: int("confidence"), // 0-100 confidence score
    feedback: text("feedback"), // User feedback on response quality
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userIdIdx: index("idx_user_id").on(table.userId),
    createdAtIdx: index("idx_created_at").on(table.createdAt),
  })
);

// Type exports for use in application
export type LegalCode = typeof legalCodes.$inferSelect;
export type LegalCodeInsert = typeof legalCodes.$inferInsert;

export type LegalCodeSection = typeof legalCodeSections.$inferSelect;
export type LegalCodeSectionInsert = typeof legalCodeSections.$inferInsert;

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type DocumentTemplateInsert = typeof documentTemplates.$inferInsert;

export type TemplateField = typeof templateFields.$inferSelect;
export type TemplateFieldInsert = typeof templateFields.$inferInsert;

export type GeneratedDocument = typeof generatedDocuments.$inferSelect;
export type GeneratedDocumentInsert = typeof generatedDocuments.$inferInsert;

export type LegalAdviceLog = typeof legalAdviceLog.$inferSelect;
export type LegalAdviceLogInsert = typeof legalAdviceLog.$inferInsert;
