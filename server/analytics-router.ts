import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { cases, clients, invoices, timeEntries, users } from "../drizzle/schema";
import { eq, sql, gte, and, desc } from "drizzle-orm";

/**
 * Analytics Router
 * tRPC procedures for practice metrics and performance reporting
 */
export const analyticsRouter = router({
  /**
   * Get high-level practice metrics
   */
  getPracticeMetrics: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {
      totalCases: 0,
      activeCases: 0,
      totalClients: 0,
      totalRevenue: 0,
      outstandingRevenue: 0,
      billableRate: 0,
      hoursThisMonth: 0
    };

    try {
      const [totalCases] = await db.select({ count: sql<number>`count(*)` }).from(cases);
      const [activeCases] = await db.select({ count: sql<number>`count(*)` }).from(cases).where(eq(cases.status, "active"));
      const [totalClients] = await db.select({ count: sql<number>`count(*)` }).from(clients);

      const [totalRevenue] = await db.select({ sum: sql<number>`sum(amount)` }).from(invoices).where(eq(invoices.status, "paid"));
      const [outstandingRevenue] = await db.select({ sum: sql<number>`sum(amount)` }).from(invoices).where(sql`${invoices.status} != 'paid' AND ${invoices.status} != 'cancelled'`);

      // Calculate billable rate (billable vs non-billable hours)
      const timeStats = await db.select({
        billable: sql<number>`sum(case when billable = 1 then hours else 0 end)`,
        total: sql<number>`sum(hours)`
      }).from(timeEntries);

      // Hours this month
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const [hoursThisMonth] = await db.select({ sum: sql<number>`sum(hours)` }).from(timeEntries).where(gte(timeEntries.entryDate, firstDayOfMonth));

      const billableRate = timeStats[0]?.total ? (timeStats[0].billable / timeStats[0].total) * 100 : 0;

      return {
        totalCases: Number(totalCases?.count || 0),
        activeCases: Number(activeCases?.count || 0),
        totalClients: Number(totalClients?.count || 0),
        totalRevenue: Number(totalRevenue?.sum || 0),
        outstandingRevenue: Number(outstandingRevenue?.sum || 0),
        billableRate: Math.round(billableRate * 10) / 10,
        hoursThisMonth: Math.round(Number(hoursThisMonth?.sum || 0) / 60),
      };
    } catch (error) {
      console.error("Error in getPracticeMetrics:", error);
      throw new Error("Failed to fetch practice metrics");
    }
  }),

  /**
   * Get monthly trends for cases and billing
   */
  getMonthlyTrends: protectedProcedure.query(async () => {
    // In production, this would query by month using SQL group by
    // For now, we return a structured mock that reflects the 6-month view
    return [
      { month: "Jan", active: 8, closed: 2, invoiced: 45000, paid: 42000 },
      { month: "Feb", active: 10, closed: 3, invoiced: 52000, paid: 50000 },
      { month: "Mar", active: 12, closed: 4, invoiced: 48000, paid: 48000 },
      { month: "Apr", active: 11, closed: 5, invoiced: 61000, paid: 58000 },
      { month: "May", active: 13, closed: 6, invoiced: 55000, paid: 52000 },
      { month: "Jun", active: 12, closed: 7, invoiced: 67000, paid: 65000 },
    ];
  }),

  /**
   * Get distribution metrics (case types and lawyer productivity)
   */
  getDistributionData: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { caseTypes: [], lawyerProductivity: [] };

    try {
      // Case type distribution
      const caseTypes = await db.select({
        name: sql<string>`coalesce(${cases.caseType}, 'Other')`,
        value: sql<number>`count(*)`
      }).from(cases).groupBy(cases.caseType);

      // Lawyer productivity
      const lawyerProductivity = await db.select({
        lawyer: users.name,
        cases: sql<number>`count(distinct ${cases.id})`,
        hours: sql<number>`coalesce(sum(${timeEntries.hours}), 0)`,
        billable: sql<number>`coalesce(sum(case when ${timeEntries.billable} = 1 then ${timeEntries.hours} else 0 end), 0)`
      })
      .from(users)
      .leftJoin(cases, eq(cases.assignedLawyerId, users.id))
      .leftJoin(timeEntries, eq(timeEntries.caseId, cases.id))
      .where(eq(users.role, "lawyer"))
      .groupBy(users.id);

      return {
        caseTypes: caseTypes.map(c => ({
          name: c.name,
          value: Number(c.value),
          color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random color if needed
        })),
        lawyerProductivity: lawyerProductivity.map(l => ({
          lawyer: l.lawyer || "Unknown",
          cases: Number(l.cases),
          hours: Math.round(Number(l.hours) / 60), // to hours
          billable: Math.round(Number(l.billable) / 60)
        })),
      };
    } catch (error) {
      console.error("Error in getDistributionData:", error);
      throw new Error("Failed to fetch distribution metrics");
    }
  }),
});
