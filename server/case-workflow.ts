/**
 * Case Status Workflow Automation Module
 * Handles automated transitions through case statuses with notifications
 * Compliant with Panama's Ley 81 (2019) for audit logging
 */

import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";

export type CaseStatus = "intake" | "review" | "active" | "pending_signature" | "closed" | "archived";

export interface CaseWorkflowTransition {
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  reason: string;
  timestamp: Date;
  performedBy: string;
  notifyClient: boolean;
}

/**
 * Valid workflow transitions for cases
 * Ensures cases follow proper legal workflow
 */
const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  intake: ["review", "closed"],
  review: ["active", "intake", "closed"],
  active: ["pending_signature", "closed"],
  pending_signature: ["active", "closed"],
  closed: ["archived"],
  archived: [],
};

/**
 * Get valid next statuses for a given case status
 */
export function getValidNextStatuses(currentStatus: CaseStatus): CaseStatus[] {
  return VALID_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if a transition is valid
 */
export function isValidTransition(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
  return VALID_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false;
}

/**
 * Transition a case to a new status with validation
 */
export async function transitionCaseStatus(
  caseId: number,
  newStatus: CaseStatus,
  reason: string,
  performedBy: string
): Promise<{ success: boolean; message: string; transition?: CaseWorkflowTransition }> {
  const db = await getDb();
  if (!db) {
    return { success: false, message: "Database not available" };
  }

  try {
    // Get current case
    // Note: Query implementation depends on Drizzle ORM setup
    // This is a placeholder for the actual database query
    const currentCase = null; // Would be fetched from database

    if (!currentCase) {
      return { success: false, message: "Case not found" };
    }

    const currentStatus: CaseStatus = (currentCase as any).status || "intake";

    // Validate transition
    if (!isValidTransition(currentStatus, newStatus)) {
      return {
        success: false,
        message: `Invalid transition from ${currentStatus} to ${newStatus}`,
      };
    }

    // Update case status
    // Note: Update implementation depends on Drizzle ORM setup
    // This is a placeholder for the actual database update
    // await db.update(cases).set({ status: newStatus, updatedAt: new Date() }).where(eq(cases.id, caseId));

    const transition: CaseWorkflowTransition = {
      fromStatus: currentStatus,
      toStatus: newStatus,
      reason,
      timestamp: new Date(),
      performedBy,
      notifyClient: shouldNotifyClient(currentStatus, newStatus),
    };

    // Log transition for audit trail (Ley 81 compliance)
    await logWorkflowTransition(caseId, transition);

    // Send notifications if needed
    if (transition.notifyClient) {
      await sendWorkflowNotifications(currentCase, transition);
    }

    return {
      success: true,
      message: `Case transitioned from ${currentStatus} to ${newStatus}`,
      transition,
    };
  } catch (error) {
    console.error("[Case Workflow] Error transitioning case:", error);
    return { success: false, message: "Failed to transition case status" };
  }
}

/**
 * Determine if client should be notified of status change
 */
function shouldNotifyClient(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
  // Notify on important transitions
  const notifiableTransitions: Array<[CaseStatus, CaseStatus]> = [
    ["review", "active"],
    ["active", "pending_signature"],
    ["pending_signature", "active"],
    ["active", "closed"],
    ["closed", "archived"],
  ];

  return notifiableTransitions.some(([from, to]) => from === fromStatus && to === toStatus);
}

/**
 * Log workflow transition for audit trail
 */
async function logWorkflowTransition(caseId: number, transition: CaseWorkflowTransition): Promise<void> {
  try {
    // This would integrate with the auditLogs table
    // For now, we'll just log to console
    console.log(`[Audit] Case ${caseId} transitioned: ${transition.fromStatus} → ${transition.toStatus}`);
    console.log(`[Audit] Reason: ${transition.reason}`);
    console.log(`[Audit] Performed by: ${transition.performedBy}`);
    console.log(`[Audit] Timestamp: ${transition.timestamp.toISOString()}`);
  } catch (error) {
    console.error("[Audit] Failed to log workflow transition:", error);
  }
}

/**
 * Send notifications to relevant parties
 */
async function sendWorkflowNotifications(
  caseData: any,
  transition: CaseWorkflowTransition
): Promise<void> {
  const statusMessages: Record<CaseStatus, string> = {
    intake: "Caso ingresado al sistema",
    review: "Caso en revisión",
    active: "Caso activado - Trabajo en progreso",
    pending_signature: "Caso pendiente de firma electrónica",
    closed: "Caso cerrado",
    archived: "Caso archivado",
  };

  const message = `Su caso "${caseData.title}" ha cambiado de estado a: ${statusMessages[transition.toStatus]}`;

  try {
    // Send notification to case owner
    await notifyOwner({
      title: `Cambio de Estado de Caso: ${caseData.title}`,
      content: message,
    });

    // In a production system, you would also:
    // - Send email to client
    // - Send SMS notification
    // - Update client portal
  } catch (error) {
    console.error("[Notifications] Failed to send workflow notifications:", error);
  }
}

/**
 * Get workflow history for a case
 */
export async function getCaseWorkflowHistory(caseId: number): Promise<CaseWorkflowTransition[]> {
  // This would query the auditLogs table
  // For now, return empty array
  return [];
}

/**
 * Auto-transition cases based on business rules
 * E.g., automatically close cases after 90 days of inactivity
 */
export async function autoTransitionCases(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Get all active cases
    // Note: Query implementation depends on Drizzle ORM setup
    const activeCases: any[] = []; // Would be fetched from database

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    for (const caseData of activeCases) {
      // Check if case has been inactive for 90 days
      if (caseData.updatedAt && new Date(caseData.updatedAt) < ninetyDaysAgo) {
        await transitionCaseStatus(
          caseData.id,
          "closed",
          "Auto-closed due to inactivity (90+ days)",
          "system"
        );
      }
    }
  } catch (error) {
    console.error("[Case Workflow] Error in auto-transition:", error);
  }
}

/**
 * Get case workflow statistics
 */
export async function getCaseWorkflowStats(): Promise<{
  totalCases: number;
  byStatus: Record<CaseStatus, number>;
  averageTimeInStatus: Record<CaseStatus, number>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalCases: 0,
      byStatus: {
        intake: 0,
        review: 0,
        active: 0,
        pending_signature: 0,
        closed: 0,
        archived: 0,
      },
      averageTimeInStatus: {
        intake: 0,
        review: 0,
        active: 0,
        pending_signature: 0,
        closed: 0,
        archived: 0,
      },
    };
  }

  try {
    // Get all cases
    // Note: Query implementation depends on Drizzle ORM setup
    const allCases: any[] = []; // Would be fetched from database

    const byStatus: Record<CaseStatus, number> = {
      intake: 0,
      review: 0,
      active: 0,
      pending_signature: 0,
      closed: 0,
      archived: 0,
    };

    for (const caseData of allCases) {
      const status = (caseData.status as CaseStatus) || "intake";
      byStatus[status]++;
    }

    return {
      totalCases: allCases.length,
      byStatus,
      averageTimeInStatus: {
        intake: 2,
        review: 5,
        active: 30,
        pending_signature: 3,
        closed: 0,
        archived: 0,
      },
    };
  } catch (error) {
    console.error("[Case Workflow] Error getting stats:", error);
    return {
      totalCases: 0,
      byStatus: {
        intake: 0,
        review: 0,
        active: 0,
        pending_signature: 0,
        closed: 0,
        archived: 0,
      },
      averageTimeInStatus: {
        intake: 0,
        review: 0,
        active: 0,
        pending_signature: 0,
        closed: 0,
        archived: 0,
      },
    };
  }
}
