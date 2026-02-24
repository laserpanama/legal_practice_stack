import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  transitionCaseStatus,
  getCaseWorkflowStats,
  getCaseWorkflowHistory,
  type CaseStatus
} from "./case-workflow";

/**
 * Workflow Router
 * tRPC procedures for case status management and workflow automation
 */
export const workflowRouter = router({
  /**
   * Transition a case to a new status
   */
  transitionCaseStatus: protectedProcedure
    .input(
      z.object({
        caseId: z.number(),
        newStatus: z.enum(["intake", "review", "active", "pending_signature", "closed", "archived"]),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await transitionCaseStatus(
          input.caseId,
          input.newStatus as CaseStatus,
          input.reason,
          ctx.user.name || ctx.user.email || "System"
        );
      } catch (error) {
        console.error("Error in transitionCaseStatus procedure:", error);
        throw new Error("Failed to transition case status");
      }
    }),

  /**
   * Get overall case workflow statistics
   */
  getCaseWorkflowStats: protectedProcedure.query(async () => {
    try {
      return await getCaseWorkflowStats();
    } catch (error) {
      console.error("Error in getCaseWorkflowStats procedure:", error);
      throw new Error("Failed to fetch workflow statistics");
    }
  }),

  /**
   * Get status history for a specific case
   */
  getCaseWorkflowHistory: protectedProcedure
    .input(z.object({ caseId: z.number() }))
    .query(async ({ input }) => {
      try {
        return await getCaseWorkflowHistory(input.caseId);
      } catch (error) {
        console.error("Error in getCaseWorkflowHistory procedure:", error);
        throw new Error("Failed to fetch case workflow history");
      }
    }),
});
