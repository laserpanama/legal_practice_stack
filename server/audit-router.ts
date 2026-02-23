/**
 * Audit Dashboard Router
 * tRPC procedures for signature audit trail management and compliance reporting
 */

import { z } from "zod";
import { adminProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  getSignatureRequests,
  getSignatureAuditTrail,
  getComplianceStatistics,
  generateComplianceReport,
  exportAuditTrailToCSV,
} from "./signature-audit-service";
import { getAuditLogsByUserId } from "./db";

export const auditRouter = router({
  /**
   * Get all signature requests with filtering and pagination
   * Admin only
   */
  getSignatureRequests: adminProcedure
    .input(
      z.object({
        status: z.enum([
          "pending",
          "sent",
          "viewed",
          "signed",
          "rejected",
          "expired",
          "cancelled",
        ]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        signerEmail: z.string().email().optional(),
        requesterId: z.number().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const requests = await getSignatureRequests({
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
          signerEmail: input.signerEmail,
          requesterId: input.requesterId,
          limit: input.limit,
          offset: input.offset,
        });

        return {
          success: true,
          data: requests,
          count: requests.length,
        };
      } catch (error) {
        console.error("Error fetching signature requests:", error);
        throw new Error("Failed to fetch signature requests");
      }
    }),

  /**
   * Get audit trail for a specific signature request
   * Admin only
   */
  getAuditTrail: adminProcedure
    .input(
      z.object({
        signatureRequestId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const events = await getSignatureAuditTrail(
          input.signatureRequestId
        );

        return {
          success: true,
          data: events,
          count: events.length,
        };
      } catch (error) {
        console.error("Error fetching audit trail:", error);
        throw new Error("Failed to fetch audit trail");
      }
    }),

  /**
   * Get compliance statistics for a date range
   * Admin only
   */
  getComplianceStatistics: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const stats = await getComplianceStatistics(
          input.startDate,
          input.endDate
        );

        return {
          success: true,
          data: stats,
        };
      } catch (error) {
        console.error("Error fetching compliance statistics:", error);
        throw new Error("Failed to fetch compliance statistics");
      }
    }),

  /**
   * Generate compliance report for a date range
   * Admin only
   */
  generateComplianceReport: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const report = await generateComplianceReport(
          input.startDate,
          input.endDate
        );

        // Override the generatedBy field with current user
        report.generatedBy = ctx.user.id;

        return {
          success: true,
          data: report,
          message: "Compliance report generated successfully",
        };
      } catch (error) {
        console.error("Error generating compliance report:", error);
        throw new Error("Failed to generate compliance report");
      }
    }),

  /**
   * Export audit trail to CSV
   * Admin only
   */
  exportAuditTrailToCSV: adminProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const csv = await exportAuditTrailToCSV(
          input.startDate,
          input.endDate
        );

        return {
          success: true,
          data: csv,
          filename: `audit-trail-${input.startDate.toISOString().split("T")[0]}-to-${input.endDate.toISOString().split("T")[0]}.csv`,
        };
      } catch (error) {
        console.error("Error exporting audit trail:", error);
        throw new Error("Failed to export audit trail");
      }
    }),

  /**
   * Get dashboard summary statistics
   * Admin only
   */
  getDashboardSummary: adminProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - input.days * 24 * 60 * 60 * 1000);

        const stats = await getComplianceStatistics(startDate, endDate);

        return {
          success: true,
          data: {
            ...stats,
            period: `Last ${input.days} days`,
          },
        };
      } catch (error) {
        console.error("Error fetching dashboard summary:", error);
        throw new Error("Failed to fetch dashboard summary");
      }
    }),

  /**
   * Get signature request details
   * Admin only
   */
  getSignatureRequestDetails: adminProcedure
    .input(
      z.object({
        signatureRequestId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const requests = await getSignatureRequests({
          limit: 1,
          offset: 0,
        });

        // Find the specific request
        const request = requests.find(
          (r: any) => r.id === input.signatureRequestId
        );

        if (!request) {
          throw new Error("Signature request not found");
        }

        // Get audit trail
        const auditTrail = await getSignatureAuditTrail(
          input.signatureRequestId
        );

        return {
          success: true,
          data: {
            request,
            auditTrail,
          },
        };
      } catch (error) {
        console.error("Error fetching signature request details:", error);
        throw new Error("Failed to fetch signature request details");
      }
    }),

  /**
   * Get audit logs for the current user
   */
  listByUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getAuditLogsByUserId(ctx.user.id);
    } catch (error) {
      console.error("Error fetching user audit logs:", error);
      throw new Error("Failed to fetch user audit logs");
    }
  }),
});
