/**
 * Alexa (LexAI) Router
 * tRPC procedures for legal knowledge base access and document generation
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import * as legalKnowledge from "./legal-knowledge-service";
import { invokeLLM } from "./_core/llm";

export const alexaRouter = router({
  /**
   * Search legal codes by keyword
   */
  searchLegalCodes: publicProcedure
    .input(
      z.object({
        keyword: z.string().min(1, "Keyword required"),
        codeType: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const codes = await legalKnowledge.searchLegalCodes(
        input.keyword,
        input.codeType,
        input.limit
      );
      return {
        results: codes,
        count: codes.length,
      };
    }),

  /**
   * Get legal code by ID
   */
  getLegalCode: publicProcedure
    .input(z.object({ codeId: z.number() }))
    .query(async ({ input }) => {
      const code = await legalKnowledge.getLegalCodeById(input.codeId);
      if (!code) {
        throw new Error("Legal code not found");
      }

      const sections = await legalKnowledge.getLegalCodeSections(input.codeId);

      return {
        code,
        sections,
        formatted: legalKnowledge.formatLegalCodeForContext(code),
      };
    }),

  /**
   * Search legal code sections
   */
  searchCodeSections: publicProcedure
    .input(
      z.object({
        keyword: z.string().min(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const sections = await legalKnowledge.searchLegalCodeSections(
        input.keyword,
        input.limit
      );
      return {
        results: sections,
        count: sections.length,
      };
    }),

  /**
   * Get all legal codes by type
   */
  getLegalCodesByType: publicProcedure
    .input(z.object({ codeType: z.string() }))
    .query(async ({ input }) => {
      const codes = await legalKnowledge.getLegalCodesByType(input.codeType);
      return {
        results: codes,
        count: codes.length,
      };
    }),

  /**
   * Search document templates
   */
  searchTemplates: publicProcedure
    .input(
      z.object({
        keyword: z.string().min(1),
        templateType: z.string().optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      const templates = await legalKnowledge.searchDocumentTemplates(
        input.keyword,
        input.templateType,
        input.limit
      );
      return {
        results: templates,
        count: templates.length,
      };
    }),

  /**
   * Get template by ID with fields
   */
  getTemplate: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const template = await legalKnowledge.getDocumentTemplateById(
        input.templateId
      );
      if (!template) {
        throw new Error("Template not found");
      }

      return {
        template,
        formatted: legalKnowledge.formatTemplateForContext(template),
      };
    }),

  /**
   * Get all templates by type
   */
  getTemplatesByType: publicProcedure
    .input(z.object({ templateType: z.string() }))
    .query(async ({ input }) => {
      const templates = await legalKnowledge.getDocumentTemplatesByType(
        input.templateType
      );
      return {
        results: templates,
        count: templates.length,
      };
    }),

  /**
   * Get all available templates
   */
  getAllTemplates: publicProcedure.query(async () => {
    const templates = await legalKnowledge.getAllDocumentTemplates();
    return {
      results: templates,
      count: templates.length,
    };
  }),

  /**
   * Generate legal document from template with AI assistance
   */
  generateDocument: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        documentName: z.string(),
        filledData: z.record(z.string(), z.any()),
        useAI: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get template
      const template = await legalKnowledge.getDocumentTemplateById(
        input.templateId
      );
      if (!template) {
        throw new Error("Template not found");
      }

      // Fill template with data
      let documentContent = template.templateContent;
      for (const [key, value] of Object.entries(input.filledData)) {
        documentContent = documentContent.replace(
          new RegExp(`{{${key}}}`, "g"),
          String(value)
        );
      }

      // If AI assistance requested, enhance document
      if (input.useAI) {
        try {
          const aiResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are a legal document expert for Panama. Review and improve the following legal document, ensuring it complies with Panamanian law and is professionally formatted.",
              },
              {
                role: "user",
                content: `Please review and improve this legal document:\n\n${documentContent}`,
              },
            ],
          });

          if (
            aiResponse.choices &&
            aiResponse.choices[0] &&
            aiResponse.choices[0].message
          ) {
            const content = aiResponse.choices[0].message.content;
            if (typeof content === "string") {
              documentContent = content;
            }
          }
        } catch (error) {
          console.error("Error with AI enhancement:", error);
          // Continue with original document if AI fails
        }
      }

      // Save generated document
      const docId = await legalKnowledge.createGeneratedDocument(
        input.templateId,
        ctx.user.id,
        input.documentName,
        documentContent,
        input.filledData
      );

      return {
        documentId: docId,
        documentName: input.documentName,
        documentContent,
        status: "draft",
      };
    }),

  /**
   * Get user's generated documents
   */
  getUserDocuments: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const documents = await legalKnowledge.getGeneratedDocumentsByUser(
        ctx.user.id,
        input.limit
      );
      return {
        results: documents,
        count: documents.length,
      };
    }),

  /**
   * Get legal advice from Alexa with cited codes and templates
   */
  getLegalAdvice: protectedProcedure
    .input(
      z.object({
        query: z.string().min(10, "Query must be at least 10 characters"),
        context: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Search for relevant codes
        const relevantCodes = await legalKnowledge.searchLegalCodes(
          input.query,
          undefined,
          5
        );

        // Search for relevant templates
        const relevantTemplates = await legalKnowledge.searchDocumentTemplates(
          input.query,
          undefined,
          5
        );

        // Format codes and templates for LLM context
        const codesContext = relevantCodes
          .map((code) => legalKnowledge.formatLegalCodeForContext(code))
          .join("\n");

        const templatesContext = await Promise.all(
          relevantTemplates.map(async (template) => {
            const fullTemplate = await legalKnowledge.getDocumentTemplateById(
              template.id
            );
            return fullTemplate
              ? legalKnowledge.formatTemplateForContext(fullTemplate)
              : "";
          })
        );

        // Get legal advice from LLM
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are Alexa, a legal assistant for Panama. Provide accurate legal advice based on Panamanian law. 
              
RELEVANT LEGAL CODES:
${codesContext}

RELEVANT DOCUMENT TEMPLATES:
${templatesContext.join("\n")}

Always cite specific legal codes and articles. Be professional and clear. Recommend templates when applicable.`,
            },
            {
              role: "user",
              content: input.query,
            },
          ],
        });

        let advice = "Unable to generate advice";
        if (
          response.choices &&
          response.choices[0] &&
          response.choices[0].message
        ) {
          const content = response.choices[0].message.content;
          if (typeof content === "string") {
            advice = content;
          }
        }

        // Log the advice
        const logId = await legalKnowledge.logLegalAdvice(
          ctx.user.id,
          input.query,
          advice,
          relevantCodes.map((c) => c.id),
          relevantTemplates.map((t) => t.id),
          false,
          undefined,
          75
        );

        return {
          advice,
          citedCodes: relevantCodes,
          recommendedTemplates: relevantTemplates,
          logId,
        };
      } catch (error) {
        console.error("Error generating legal advice:", error);
        throw new Error("Failed to generate legal advice");
      }
    }),

  /**
   * Get user's legal advice history
   */
  getAdviceHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const history = await legalKnowledge.getLegalAdviceHistory(
        ctx.user.id,
        input.limit
      );
      return {
        results: history,
        count: history.length,
      };
    }),

  /**
   * Get related legal codes for a topic
   */
  getRelatedCodes: publicProcedure
    .input(z.object({ topic: z.string(), limit: z.number().default(5) }))
    .query(async ({ input }) => {
      const codes = await legalKnowledge.getRelatedLegalCodes(
        input.topic,
        input.limit
      );
      return {
        results: codes,
        count: codes.length,
      };
    }),

  /**
   * Get template fields for a specific template
   */
  getTemplateFields: publicProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const fields = await legalKnowledge.getTemplateFields(input.templateId);
      return {
        results: fields,
        count: fields.length,
      };
    }),
});

export type AlexaRouter = typeof alexaRouter;
