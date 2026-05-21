import type { PlanOption, ToolName } from "@/types/audit";

export const TOOL_PLANS: Record<ToolName, PlanOption[]> = {
  cursor: [
    { value: "hobby", label: "Hobby", pricePerSeat: 0 },
    { value: "pro", label: "Pro", pricePerSeat: 20 },
    { value: "business", label: "Business", pricePerSeat: 40 },
  ],
  "github-copilot": [
    { value: "individual", label: "Individual", pricePerSeat: 10 },
    { value: "business", label: "Business", pricePerSeat: 19 },
    { value: "enterprise", label: "Enterprise", pricePerSeat: 39 },
  ],
  claude: [
    { value: "free", label: "Free", pricePerSeat: 0 },
    { value: "pro", label: "Pro", pricePerSeat: 20 },
    { value: "max", label: "Max", pricePerSeat: 100 },
    { value: "team", label: "Team", pricePerSeat: 30 },
  ],
  chatgpt: [
    { value: "plus", label: "Plus", pricePerSeat: 20 },
    { value: "team", label: "Team", pricePerSeat: 30 },
  ],
  "anthropic-api": [
    { value: "api-direct", label: "API Direct", pricePerSeat: 0 },
  ],
  "openai-api": [
    { value: "api-direct", label: "API Direct", pricePerSeat: 0 },
  ],
  gemini: [
    { value: "free", label: "Free", pricePerSeat: 0 },
    { value: "pro", label: "Pro", pricePerSeat: 20 },
    { value: "ultra", label: "Ultra", pricePerSeat: 30 },
  ],
  windsurf: [
    { value: "free", label: "Free", pricePerSeat: 0 },
    { value: "pro", label: "Pro", pricePerSeat: 15 },
    { value: "teams", label: "Teams", pricePerSeat: 35 },
  ],
};

export const TOOL_LABELS: Record<ToolName, string> = {
  cursor: "Cursor",
  "github-copilot": "GitHub Copilot",
  claude: "Claude (Anthropic)",
  chatgpt: "ChatGPT",
  "anthropic-api": "Anthropic API",
  "openai-api": "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export const USE_CASES: { value: string; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];
