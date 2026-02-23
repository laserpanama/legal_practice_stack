/**
 * Legal Knowledge Base Service
 * Provides access to Panamanian legal codes and document templates for Alexa
 */

import { getDb } from "./db";
import {
  legalCodes,
  legalCodeSections,
  documentTemplates,
  templateFields,
  generatedDocuments,
  legalAdviceLog,
  type LegalCode,
  type LegalCodeSection,
  type DocumentTemplate,
  type TemplateField,
} from "../drizzle/legal-knowledge-schema";
import { eq, like, inArray, and, desc } from "drizzle-orm";

/**
 * Search legal codes by keyword
 */
export async function searchLegalCodes(
  keyword: string,
  codeType?: string,
  limit: number = 10
): Promise<LegalCode[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    
    let query = db
      .select()
      .from(legalCodes)
      .where(codeType ? and(eq(legalCodes.codeType, codeType as any)) : undefined)
      .limit(limit);

    // Execute query and filter by keyword
    const results = await query;
    return results.filter(
      (code) =>
        code.title.toLowerCase().includes(keyword.toLowerCase()) ||
        code.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        code.fullText.toLowerCase().includes(keyword.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching legal codes:", error);
    return [];
  }
}

/**
 * Get legal code by ID
 */
export async function getLegalCodeById(codeId: number): Promise<LegalCode | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db
      .select()
      .from(legalCodes)
      .where(eq(legalCodes.id, codeId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting legal code:", error);
    return null;
  }
}

/**
 * Get legal code sections by code ID
 */
export async function getLegalCodeSections(
  codeId: number
): Promise<LegalCodeSection[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const sections = await db
      .select()
      .from(legalCodeSections)
      .where(eq(legalCodeSections.codeId, codeId));

    return sections;
  } catch (error) {
    console.error("Error getting legal code sections:", error);
    return [];
  }
}

/**
 * Search legal code sections by keyword
 */
export async function searchLegalCodeSections(
  keyword: string,
  limit: number = 20
): Promise<(LegalCodeSection & { code: LegalCode })[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const sections = await db
      .select()
      .from(legalCodeSections)
      .limit(limit);

    // Filter sections by keyword
    const filtered = sections.filter(
      (section: LegalCodeSection) =>
        section.sectionTitle?.toLowerCase().includes(keyword.toLowerCase()) ||
        section.sectionText.toLowerCase().includes(keyword.toLowerCase()) ||
        section.keywords?.toLowerCase().includes(keyword.toLowerCase())
    );

    // Get associated codes
    const codeIds = Array.from(new Set(filtered.map((s: LegalCodeSection) => s.codeId)));
    const codes = await db!
      .select()
      .from(legalCodes)
      .where(inArray(legalCodes.id, codeIds));

    const codeMap = new Map(codes.map((c: LegalCode) => [c.id, c]));

    return filtered.map((section: LegalCodeSection) => ({
      ...section,
      code: codeMap.get(section.codeId)!,
    }));
  } catch (error) {
    console.error("Error searching legal code sections:", error);
    return [];
  }
}

/**
 * Get all legal codes by type
 */
export async function getLegalCodesByType(
  codeType: string
): Promise<LegalCode[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const codes = await db
      .select()
      .from(legalCodes)
      .where(eq(legalCodes.codeType, codeType as any));

    return codes;
  } catch (error) {
    console.error("Error getting legal codes by type:", error);
    return [];
  }
}

/**
 * Search document templates
 */
export async function searchDocumentTemplates(
  keyword: string,
  templateType?: string,
  limit: number = 10
): Promise<DocumentTemplate[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    
    const conditions = [eq(documentTemplates.isActive, 1)];
    if (templateType) {
      conditions.push(eq(documentTemplates.templateType, templateType as any));
    }
    
    const results = await db
      .select()
      .from(documentTemplates)
      .where(and(...conditions))
      .limit(limit);

    // Filter by keyword
    return results.filter(
      (template: DocumentTemplate) =>
        template.templateName.toLowerCase().includes(keyword.toLowerCase()) ||
        template.description?.toLowerCase().includes(keyword.toLowerCase()) ||
        template.category?.toLowerCase().includes(keyword.toLowerCase())
    );
  } catch (error) {
    console.error("Error searching document templates:", error);
    return [];
  }
}

/**
 * Get document template by ID with fields
 */
export async function getDocumentTemplateById(
  templateId: number
): Promise<(DocumentTemplate & { fields: TemplateField[] }) | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const template = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.id, templateId))
      .limit(1);

    if (template.length === 0) return null;

    const fields = await db!
      .select()
      .from(templateFields)
      .where(eq(templateFields.templateId, templateId));

    return {
      ...template[0],
      fields,
    };
  } catch (error) {
    console.error("Error getting document template:", error);
    return null;
  }
}

/**
 * Get all document templates by type
 */
export async function getDocumentTemplatesByType(
  templateType: string
): Promise<DocumentTemplate[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const templates = await db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.templateType, templateType as any),
          eq(documentTemplates.isActive, 1)
        )
      );

    return templates;
  } catch (error) {
    console.error("Error getting document templates by type:", error);
    return [];
  }
}

/**
 * Get all active document templates
 */
export async function getAllDocumentTemplates(): Promise<DocumentTemplate[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const templates = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.isActive, 1));

    return templates;
  } catch (error) {
    console.error("Error getting all document templates:", error);
    return [];
  }
}

/**
 * Create generated document from template
 */
export async function createGeneratedDocument(
  templateId: number,
  userId: number,
  documentName: string,
  documentContent: string,
  filledData: Record<string, any>
): Promise<number | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.insert(generatedDocuments).values({
      templateId,
      userId,
      documentName,
      documentContent,
      filledData: JSON.stringify(filledData),
      status: "draft",
    });

    return result && (result as any).insertId ? Number((result as any).insertId) : null;
  } catch (error) {
    console.error("Error creating generated document:", error);
    return null;
  }
}

/**
 * Get generated documents by user
 */
export async function getGeneratedDocumentsByUser(
  userId: number,
  limit: number = 20
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const documents = await db
      .select()
      .from(generatedDocuments)
      .where(eq(generatedDocuments.userId, userId))
      .limit(limit);

    return documents.map((doc: any) => ({
      ...doc,
      filledData: JSON.parse(doc.filledData || "{}"),
    }));
  } catch (error) {
    console.error("Error getting generated documents:", error);
    return [];
  }
}

/**
 * Log legal advice provided by Alexa
 */
export async function logLegalAdvice(
  userId: number,
  query: string,
  response: string,
  citedCodes: number[],
  usedTemplates: number[],
  documentGenerated: boolean = false,
  generatedDocumentId?: number,
  confidence: number = 75
): Promise<number | null> {
  try {
    const db = await getDb();
    if (!db) return null;
    const result = await db.insert(legalAdviceLog).values({
      userId,
      query,
      response,
      citedCodes: JSON.stringify(citedCodes),
      usedTemplates: JSON.stringify(usedTemplates),
      documentGenerated: documentGenerated ? 1 : 0,
      generatedDocumentId,
      confidence,
    });

    return result && (result as any).insertId ? Number((result as any).insertId) : null;
  } catch (error) {
    console.error("Error logging legal advice:", error);
    return null;
  }
}

/**
 * Get legal advice history for user
 */
export async function getLegalAdviceHistory(
  userId: number,
  limit: number = 50
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const history = await db
      .select()
      .from(legalAdviceLog)
      .where(eq(legalAdviceLog.userId, userId))
      .limit(limit);

    return history.map((entry: any) => ({
      ...entry,
      citedCodes: JSON.parse(entry.citedCodes || "[]"),
      usedTemplates: JSON.parse(entry.usedTemplates || "[]"),
    }));
  } catch (error) {
    console.error("Error getting legal advice history:", error);
    return [];
  }
}

/**
 * Get related legal codes for a topic
 */
export async function getRelatedLegalCodes(
  topic: string,
  limit: number = 5
): Promise<LegalCode[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const codes = await db
      .select()
      .from(legalCodes)
      .limit(limit);

    return codes.filter(
      (code: LegalCode) =>
        code.title.toLowerCase().includes(topic.toLowerCase()) ||
        code.description?.toLowerCase().includes(topic.toLowerCase())
    );
  } catch (error) {
    console.error("Error getting related legal codes:", error);
    return [];
  }
}

/**
 * Get template field definitions
 */
export async function getTemplateFields(
  templateId: number
): Promise<TemplateField[]> {
  try {
    const db = await getDb();
    if (!db) return [];
    const fields = await db
      .select()
      .from(templateFields)
      .where(eq(templateFields.templateId, templateId));

    return fields;
  } catch (error) {
    console.error("Error getting template fields:", error);
    return [];
  }
}

/**
 * Format legal code for AI context
 */
export function formatLegalCodeForContext(code: LegalCode): string {
  return `
# ${code.title}
**Code Number:** ${code.codeNumber}
**Type:** ${code.codeType}
**Effective Date:** ${code.effectiveDate ? new Date(code.effectiveDate).toLocaleDateString("es-PA") : "N/A"}

## Content
${code.fullText}

---
`;
}

/**
 * Format template for AI context
 */
export function formatTemplateForContext(
  template: DocumentTemplate & { fields: TemplateField[] }
): string {
  const fieldsDescription = template.fields
    .map((f) => `- **${f.fieldLabel}** (${f.fieldType})${f.isRequired ? " [REQUIRED]" : ""}: ${f.fieldDescription || ""}`)
    .join("\n");

  return `
# Template: ${template.templateName}
**Type:** ${template.templateType}
**Category:** ${template.category}
**Description:** ${template.description}

## Required Fields
${fieldsDescription}

## Template Content
\`\`\`
${template.templateContent}
\`\`\`

---
`;
}
