export type ToolName =
  | "cursor"
  | "github-copilot"
  | "claude"
  | "chatgpt"
  | "anthropic-api"
  | "openai-api"
  | "gemini"
  | "windsurf";

export type PlanOption = {
  value: string;
  label: string;
  pricePerSeat: number;
};

export type ToolEntry = {
  id: string;
  toolName: ToolName;
  plan: string;
  seats: number;
  monthlySpend: number;
  useCase: "coding" | "writing" | "data" | "research" | "mixed";
};

export type AuditFormData = {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: "coding" | "writing" | "data" | "research" | "mixed";
};

export type AuditRecommendation = {
  toolEntryId: string;
  toolName: ToolName;
  currentPlan: string;
  currentMonthlySpend: number;
  recommendedAction: string;
  estimatedMonthlySavings: number;
  reason: string;
};

export type AuditResult = {
  id?: string;
  formData: AuditFormData;
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  generatedAt: string;
};
