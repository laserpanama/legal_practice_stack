import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("lexia router", () => {
  it("creates a new consultation session", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.createSession({
      title: "Consulta sobre Contrato Laboral",
      description: "Revisión de requisitos legales",
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBeDefined();
    expect(result.message).toContain("exitosamente");
  });

  it("saves a consultation message", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.saveMessage({
      sessionId: "test-session-1",
      type: "user",
      content: "¿Cuáles son los requisitos para un contrato laboral en Panamá?",
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it("retrieves consultation session history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.getSessionHistory({
      sessionId: "test-session-1",
    });

    expect(result.success).toBe(true);
    expect(result.sessionId).toBe("test-session-1");
    expect(Array.isArray(result.messages)).toBe(true);
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("creates AI-assisted case notes", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.createCaseNotes({
      caseId: 1,
      sessionId: "test-session-1",
      summary: "Análisis de contrato laboral bajo Ley 93 de 1973",
      keyPoints: ["Requisitos obligatorios", "Cláusulas recomendadas"],
      recommendations: ["Agregar cláusula de confidencialidad", "Especificar jurisdicción"],
    });

    expect(result.success).toBe(true);
    expect(result.noteId).toBeDefined();
    expect(result.caseId).toBe(1);
  });

  it("analyzes documents with LexIA", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.analyzeDocument({
      documentName: "Contrato_Laboral_2025.pdf",
      documentType: "contract",
      caseId: 1,
    });

    expect(result.success).toBe(true);
    expect(result.analysis).toBeDefined();
    expect(result.analysis.keyTerms).toBeInstanceOf(Array);
    expect(result.analysis.riskFactors).toBeInstanceOf(Array);
    expect(result.analysis.recommendations).toBeInstanceOf(Array);
  });

  it("retrieves consultation statistics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.getConsultationStats();

    expect(result.totalSessions).toBeGreaterThanOrEqual(0);
    expect(result.totalMessages).toBeGreaterThanOrEqual(0);
    expect(result.documentsAnalyzed).toBeGreaterThanOrEqual(0);
    expect(result.topicDistribution).toBeDefined();
  });

  it("generates legal research", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.generateLegalResearch({
      topic: "Requisitos de contrato laboral",
      jurisdiction: "Panama",
      depth: "standard",
    });

    expect(result.success).toBe(true);
    expect(result.research).toBeDefined();
    expect(result.research.sources).toBeInstanceOf(Array);
    expect(result.research.keyArticles).toBeInstanceOf(Array);
  });

  it("exports consultation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.exportConsultation({
      sessionId: "test-session-1",
      format: "pdf",
    });

    expect(result.success).toBe(true);
    expect(result.exportUrl).toBeDefined();
    expect(result.exportUrl).toContain("test-session-1");
  });

  it("handles missing session gracefully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.getSessionHistory({
      sessionId: "non-existent-session",
    });

    expect(result.success).toBe(true);
    expect(result.messages).toBeInstanceOf(Array);
  });

  it("validates document type in analysis", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lexia.analyzeDocument({
      documentName: "Pleading_2025.pdf",
      documentType: "pleading",
      caseId: 2,
    });

    expect(result.success).toBe(true);
    expect(result.analysis.documentType).toBe("pleading");
  });
});
