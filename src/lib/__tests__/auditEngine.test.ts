import { runAudit } from "@/lib/auditEngine";
import type { AuditFormData } from "@/types/audit";

describe("runAudit", () => {
  it("TEST 1 — Cursor Business downgrade", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "cursor",
          plan: "business",
          seats: 2,
          monthlySpend: 80,
          useCase: "mixed",
        },
      ],
      teamSize: 2,
      primaryUseCase: "mixed",
    };

    const result = runAudit(formData);
    const cursorRec = result.recommendations.find((r) => r.toolName === "cursor");

    expect(cursorRec?.estimatedMonthlySavings).toBe(40);
    expect(cursorRec?.recommendedAction).toContain("Pro");
  });

  it("TEST 2 — GitHub Copilot Enterprise downgrade", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "github-copilot",
          plan: "enterprise",
          seats: 5,
          monthlySpend: 195,
          useCase: "coding",
        },
      ],
      teamSize: 5,
      primaryUseCase: "coding",
    };

    const result = runAudit(formData);
    const copilotRec = result.recommendations.find(
      (r) => r.toolName === "github-copilot",
    );

    expect(copilotRec?.estimatedMonthlySavings).toBe(100);
  });

  it("TEST 3 — Claude Team to Pro switch", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "claude",
          plan: "team",
          seats: 2,
          monthlySpend: 60,
          useCase: "writing",
        },
      ],
      teamSize: 2,
      primaryUseCase: "writing",
    };

    const result = runAudit(formData);
    const claudeRec = result.recommendations.find((r) => r.toolName === "claude");

    expect(claudeRec?.estimatedMonthlySavings).toBe(20);
  });

  it("TEST 4 — ChatGPT + Claude redundancy", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "chatgpt",
          plan: "plus",
          seats: 1,
          monthlySpend: 20,
          useCase: "writing",
        },
        {
          id: "2",
          toolName: "claude",
          plan: "pro",
          seats: 1,
          monthlySpend: 20,
          useCase: "writing",
        },
      ],
      teamSize: 1,
      primaryUseCase: "writing",
    };

    const result = runAudit(formData);

    expect(
      result.recommendations.some((r) => r.estimatedMonthlySavings === 20),
    ).toBe(true);
  });

  it("TEST 5 — Anthropic API high spend triggers Credex", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "anthropic-api",
          plan: "api-direct",
          seats: 0,
          monthlySpend: 800,
          useCase: "coding",
        },
      ],
      teamSize: 3,
      primaryUseCase: "coding",
    };

    const result = runAudit(formData);
    const apiRec = result.recommendations.find(
      (r) => r.toolName === "anthropic-api",
    );

    expect(apiRec?.recommendedAction).toContain("Credex");
    expect(apiRec?.estimatedMonthlySavings).toBeCloseTo(120, 5);
  });

  it("TEST 6 — Cursor + Windsurf redundancy", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "cursor",
          plan: "pro",
          seats: 1,
          monthlySpend: 20,
          useCase: "coding",
        },
        {
          id: "2",
          toolName: "windsurf",
          plan: "pro",
          seats: 1,
          monthlySpend: 15,
          useCase: "coding",
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(formData);
    const windsurfRec = result.recommendations.find(
      (r) => r.toolName === "windsurf",
    );

    expect(windsurfRec?.recommendedAction).toContain("redundant");
    expect(windsurfRec?.estimatedMonthlySavings).toBe(15);
  });

  it("TEST 7 — Seat bloat detection", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "cursor",
          plan: "pro",
          seats: 5,
          monthlySpend: 100,
          useCase: "coding",
        },
      ],
      teamSize: 2,
      primaryUseCase: "coding",
    };

    const result = runAudit(formData);
    const bloatRec = result.recommendations.find((r) =>
      r.recommendedAction.includes("seat bloat"),
    );

    expect(bloatRec).toBeDefined();
    expect(bloatRec!.estimatedMonthlySavings).toBeGreaterThan(0);
  });

  it("TEST 8 — Already optimal setup returns zero savings", () => {
    const formData: AuditFormData = {
      tools: [
        {
          id: "1",
          toolName: "cursor",
          plan: "pro",
          seats: 2,
          monthlySpend: 40,
          useCase: "coding",
        },
      ],
      teamSize: 2,
      primaryUseCase: "coding",
    };

    const result = runAudit(formData);

    expect(result.totalMonthlySavings).toBe(0);
  });
});
