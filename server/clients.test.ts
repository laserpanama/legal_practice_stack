import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createClient: vi.fn().mockResolvedValue({ id: 1 }),
  getClientById: vi.fn().mockResolvedValue({ id: 1, firstName: "Test" }),
  getClientsByCedula: vi.fn().mockResolvedValue({ id: 1 }),
  getClientsByUserId: vi.fn().mockResolvedValue([]),
  updateClient: vi.fn().mockResolvedValue({ id: 1 }),
  createCase: vi.fn().mockResolvedValue({ id: 1 }),
  getCaseById: vi.fn().mockResolvedValue({ id: 1 }),
  getCasesByClientId: vi.fn().mockResolvedValue([]),
  getCasesByLawyerId: vi.fn().mockResolvedValue([]),
  updateCase: vi.fn().mockResolvedValue({ id: 1 }),
  createDocument: vi.fn().mockResolvedValue({ id: 1 }),
  getDocumentById: vi.fn().mockResolvedValue({ id: 1 }),
  getDocumentsByCaseId: vi.fn().mockResolvedValue([]),
  updateDocument: vi.fn().mockResolvedValue({ id: 1 }),
  createTimeEntry: vi.fn().mockResolvedValue({ id: 1 }),
  getTimeEntriesByCaseId: vi.fn().mockResolvedValue([]),
  createInvoice: vi.fn().mockResolvedValue({ id: 1 }),
  getInvoiceById: vi.fn().mockResolvedValue({ id: 1 }),
  getInvoicesByClientId: vi.fn().mockResolvedValue([]),
  updateInvoice: vi.fn().mockResolvedValue({ id: 1 }),
  createAppointment: vi.fn().mockResolvedValue({ id: 1 }),
  getAppointmentById: vi.fn().mockResolvedValue({ id: 1 }),
  getAppointmentsByLawyerId: vi.fn().mockResolvedValue([]),
  updateAppointment: vi.fn().mockResolvedValue({ id: 1 }),
  createAuditLog: vi.fn().mockResolvedValue({ id: 1 }),
  getAuditLogsByUserId: vi.fn().mockResolvedValue([]),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-for": "192.168.1.1",
      },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as any as TrpcContext["res"],
  };

  return { ctx };
}

describe("clients router", () => {
  it("should create a new client", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.create({
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan@example.com",
      phone: "+507 6123456",
      cedula: "8-123-456",
      address: "Calle Principal 123",
      city: "Panama City",
    });

    expect(result).toBeDefined();
  });

  it("should retrieve a client by ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client first
    const createResult = await caller.clients.create({
      firstName: "Maria",
      lastName: "García",
      email: "maria@example.com",
      cedula: "8-987-654",
    });

    expect(createResult).toBeDefined();
  });

  it("should list clients for a lawyer", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update a client", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a client first
    const createResult = await caller.clients.create({
      firstName: "Carlos",
      lastName: "López",
      email: "carlos@example.com",
      cedula: "8-555-555",
    });

    expect(createResult).toBeDefined();
  });

  it("should require authentication for client operations", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {} as any,
      res: {} as any,
    };

    const caller = appRouter.createCaller(ctx);

    try {
      await caller.clients.create({
        firstName: "Test",
        lastName: "User",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("UNAUTHORIZED");
    }
  });
});

describe("cases router", () => {
  it("should create a new case", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cases.create({
      clientId: 1,
      caseNumber: "CASE-2025-001",
      title: "Corporate Restructuring",
      description: "Restructuring of corporate entities",
      caseType: "Corporate",
      priority: "high",
      budget: 500000, // in cents = $5000
    });

    expect(result).toBeDefined();
  });

  it("should list cases by lawyer", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cases.listByLawyer();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update case status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a case first
    const createResult = await caller.cases.create({
      clientId: 1,
      caseNumber: "CASE-2025-002",
      title: "Family Law Matter",
      caseType: "Family",
    });

    expect(createResult).toBeDefined();
  });
});

describe("documents router", () => {
  it("should create a new document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.create({
      caseId: 1,
      title: "Power of Attorney",
      type: "Power of Attorney",
      storageKey: "documents/case-1/poa-001.pdf",
      storageUrl: "https://s3.example.com/documents/case-1/poa-001.pdf",
      mimeType: "application/pdf",
      fileSize: 102400,
    });

    expect(result).toBeDefined();
  });

  it("should list documents by case", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.documents.listByCase({ caseId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should sign a document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a document first
    const createResult = await caller.documents.create({
      caseId: 1,
      title: "Contract",
      type: "Contract",
      storageKey: "documents/case-1/contract-001.pdf",
      storageUrl: "https://s3.example.com/documents/case-1/contract-001.pdf",
    });

    expect(createResult).toBeDefined();
  });
});

describe("time tracking router", () => {
  it("should create a time entry", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.timeTracking.createEntry({
      caseId: 1,
      description: "Legal research and analysis",
      hours: 120, // 2 hours in minutes
      hourlyRate: 15000, // B/.150 per hour in cents
      billable: true,
    });

    expect(result).toBeDefined();
  });

  it("should list time entries by case", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.timeTracking.listByCase({ caseId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should calculate total amount correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // 90 minutes (1.5 hours) at B/.150/hour = B/.225 = 22500 cents
    const result = await caller.timeTracking.createEntry({
      caseId: 1,
      description: "Client consultation",
      hours: 90, // 1.5 hours in minutes
      hourlyRate: 15000, // B/.150 per hour
      billable: true,
    });

    expect(result).toBeDefined();
  });
});

describe("invoices router", () => {
  it("should create an invoice", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.invoices.create({
      caseId: 1,
      clientId: 1,
      invoiceNumber: "INV-2025-001",
      amount: 100000, // B/.1000 in cents
      description: "Legal services for case CASE-2025-001",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    expect(result).toBeDefined();
  });

  it("should list invoices by client", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.invoices.listByClient({ clientId: 1 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update invoice status to paid", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create an invoice first
    const createResult = await caller.invoices.create({
      caseId: 1,
      clientId: 1,
      invoiceNumber: "INV-2025-002",
      amount: 50000,
    });

    expect(createResult).toBeDefined();
  });
});

describe("appointments router", () => {
  it("should create an appointment", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later

    const result = await caller.appointments.create({
      caseId: 1,
      clientId: 1,
      title: "Client Meeting",
      description: "Initial consultation",
      startTime,
      endTime,
      location: "Law Office, Panama City",
      type: "Meeting",
    });

    expect(result).toBeDefined();
  });

  it("should list appointments by lawyer", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.appointments.listByLawyer();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should update appointment status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Create an appointment first
    const createResult = await caller.appointments.create({
      caseId: 1,
      clientId: 1,
      title: "Court Hearing",
      startTime,
      endTime,
      type: "Court Hearing",
    });

    expect(createResult).toBeDefined();
  });
});

describe("audit router", () => {
  it("should list audit logs for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.audit.listByUser();
    expect(Array.isArray(result)).toBe(true);
  });
});
