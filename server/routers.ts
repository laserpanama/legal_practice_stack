import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { lexiaRouter } from "./lexia-router";
import { efirmasRouter } from "./efirmas-router";
import { auditRouter } from "./audit-router";
import { alexaRouter } from "./alexa-router";
import { z } from "zod";
import {
  createClient,
  getClientById,
  getClientsByCedula,
  getClientsByUserId,
  updateClient,
  createCase,
  getCaseById,
  getCasesByClientId,
  getCasesByLawyerId,
  updateCase,
  createDocument,
  getDocumentById,
  getDocumentsByCaseId,
  updateDocument,
  createTimeEntry,
  getTimeEntriesByCaseId,
  createInvoice,
  getInvoiceById,
  getInvoicesByClientId,
  updateInvoice,
  createAppointment,
  getAppointmentById,
  getAppointmentsByLawyerId,
  updateAppointment,
  createAuditLog,
  getAuditLogsByUserId,
  getAllUsers,
  updateUser,
  deleteUser,
} from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  lexia: lexiaRouter,
  efirmas: efirmasRouter,
  audit: auditRouter,
  alexa: alexaRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ CLIENT MANAGEMENT ============
  clients: router({
    create: protectedProcedure
      .input(
        z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          cedula: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Log audit trail
        await createAuditLog({
          userId: ctx.user.id,
          action: "client_created",
          entityType: "client",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await createClient({
          userId: ctx.user.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || null,
          phone: input.phone || null,
          cedula: input.cedula || null,
          address: input.address || null,
          city: input.city || null,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getClientById(input.id);
      }),

    getByCedula: protectedProcedure
      .input(z.object({ cedula: z.string() }))
      .query(async ({ input }) => {
        return await getClientsByCedula(input.cedula);
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getClientsByUserId(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          status: z.enum(["active", "inactive", "archived"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        await createAuditLog({
          userId: ctx.user.id,
          action: "client_updated",
          entityType: "client",
          entityId: id,
          details: JSON.stringify(updateData),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await updateClient(id, updateData);
      }),
  }),

  // ============ CASE MANAGEMENT ============
  cases: router({
    create: protectedProcedure
      .input(
        z.object({
          clientId: z.number(),
          caseNumber: z.string().min(1),
          title: z.string().min(1),
          description: z.string().optional(),
          caseType: z.string().optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          budget: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAuditLog({
          userId: ctx.user.id,
          action: "case_created",
          entityType: "case",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await createCase({
          clientId: input.clientId,
          assignedLawyerId: ctx.user.id,
          caseNumber: input.caseNumber,
          title: input.title,
          description: input.description || null,
          caseType: input.caseType || null,
          priority: input.priority || "medium",
          budget: input.budget || null,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCaseById(input.id);
      }),

    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await getCasesByClientId(input.clientId);
      }),

    listByLawyer: protectedProcedure.query(async ({ ctx }) => {
      return await getCasesByLawyerId(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["open", "pending", "closed", "archived"]).optional(),
          priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          budget: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        await createAuditLog({
          userId: ctx.user.id,
          action: "case_updated",
          entityType: "case",
          entityId: id,
          details: JSON.stringify(updateData),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await updateCase(id, updateData);
      }),
  }),

  // ============ DOCUMENT MANAGEMENT ============
  documents: router({
    create: protectedProcedure
      .input(
        z.object({
          caseId: z.number().optional(),
          clientId: z.number().optional(),
          title: z.string().min(1),
          type: z.string(),
          storageKey: z.string(),
          storageUrl: z.string(),
          mimeType: z.string().optional(),
          fileSize: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAuditLog({
          userId: ctx.user.id,
          action: "document_created",
          entityType: "document",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await createDocument({
          caseId: input.caseId || null,
          clientId: input.clientId || null,
          title: input.title,
          type: input.type,
          storageKey: input.storageKey,
          storageUrl: input.storageUrl,
          mimeType: input.mimeType || null,
          fileSize: input.fileSize || null,
          createdBy: ctx.user.id,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getDocumentById(input.id);
      }),

    listByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await getDocumentsByCaseId(input.caseId);
      }),

    sign: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          signatureMetadata: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAuditLog({
          userId: ctx.user.id,
          action: "document_signed",
          entityType: "document",
          entityId: input.id,
          details: JSON.stringify(input.signatureMetadata),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await updateDocument(input.id, {
          isSigned: 1,
          signedBy: ctx.user.id,
          signedAt: new Date(),
          status: "signed",
          signatureMetadata: JSON.stringify(input.signatureMetadata || {}),
        });
      }),
  }),

  // ============ TIME TRACKING & BILLING ============
  timeTracking: router({
    createEntry: protectedProcedure
      .input(
        z.object({
          caseId: z.number(),
          description: z.string(),
          hours: z.number(), // in minutes
          hourlyRate: z.number(), // in cents
          billable: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const totalAmount = Math.round((input.hours / 60) * input.hourlyRate);

        await createAuditLog({
          userId: ctx.user.id,
          action: "time_entry_created",
          entityType: "timeEntry",
          entityId: input.caseId,
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await createTimeEntry({
          caseId: input.caseId,
          lawyerId: ctx.user.id,
          description: input.description,
          hours: input.hours,
          hourlyRate: input.hourlyRate,
          totalAmount,
          billable: input.billable ? 1 : 0,
        });
      }),

    listByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ input }) => {
        return await getTimeEntriesByCaseId(input.caseId);
      }),
  }),

  invoices: router({
    create: protectedProcedure
      .input(
        z.object({
          caseId: z.number(),
          clientId: z.number(),
          invoiceNumber: z.string(),
          amount: z.number(), // in cents
          description: z.string().optional(),
          dueDate: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAuditLog({
          userId: ctx.user.id,
          action: "invoice_created",
          entityType: "invoice",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await createInvoice({
          caseId: input.caseId,
          clientId: input.clientId,
          invoiceNumber: input.invoiceNumber,
          amount: input.amount,
          description: input.description || null,
          dueDate: input.dueDate || null,
          createdBy: ctx.user.id,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getInvoiceById(input.id);
      }),

    listByClient: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ input }) => {
        return await getInvoicesByClientId(input.clientId);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const updateData: any = { status: input.status };

        if (input.status === "paid") {
          updateData.paidDate = new Date();
        }

        await createAuditLog({
          userId: ctx.user.id,
          action: "invoice_status_updated",
          entityType: "invoice",
          entityId: input.id,
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await updateInvoice(input.id, updateData);
      }),
  }),

  // ============ USER MANAGEMENT (ADMIN ONLY) ============
  users: router({
    list: adminProcedure.query(async () => {
      return await getAllUsers();
    }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          role: z.enum(["user", "admin"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        await createAuditLog({
          userId: ctx.user.id,
          action: "user_updated",
          entityType: "user",
          entityId: id,
          details: JSON.stringify(updateData),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await updateUser(id, updateData);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (input.id === ctx.user.id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot delete your own account",
          });
        }

        await createAuditLog({
          userId: ctx.user.id,
          action: "user_deleted",
          entityType: "user",
          entityId: input.id,
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await deleteUser(input.id);
      }),
  }),

  // ============ CALENDAR & APPOINTMENTS ============
  appointments: router({
    create: protectedProcedure
      .input(
        z.object({
          caseId: z.number().optional(),
          clientId: z.number().optional(),
          title: z.string().min(1),
          description: z.string().optional(),
          startTime: z.date(),
          endTime: z.date(),
          location: z.string().optional(),
          type: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await createAuditLog({
          userId: ctx.user.id,
          action: "appointment_created",
          entityType: "appointment",
          details: JSON.stringify(input),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await createAppointment({
          caseId: input.caseId || null,
          clientId: input.clientId || null,
          lawyerId: ctx.user.id,
          title: input.title,
          description: input.description || null,
          startTime: input.startTime,
          endTime: input.endTime,
          location: input.location || null,
          type: input.type || null,
        });
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getAppointmentById(input.id);
      }),

    listByLawyer: protectedProcedure.query(async ({ ctx }) => {
      return await getAppointmentsByLawyerId(ctx.user.id);
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          startTime: z.date().optional(),
          endTime: z.date().optional(),
          location: z.string().optional(),
          status: z.enum(["scheduled", "completed", "cancelled", "rescheduled"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { id, ...updateData } = input;

        await createAuditLog({
          userId: ctx.user.id,
          action: "appointment_updated",
          entityType: "appointment",
          entityId: id,
          details: JSON.stringify(updateData),
          ipAddress: ctx.req.headers["x-forwarded-for"] as string | undefined,
        });

        return await updateAppointment(id, updateData);
      }),
  }),

  // ============ AUDIT & COMPLIANCE ============
  // Merged with comprehensive audit router from audit-router.ts
});

export type AppRouter = typeof appRouter;
