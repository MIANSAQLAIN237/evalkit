export type CompleteRequest = {
  provider: string;
  modelId: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
};

export type CompleteResponse = {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  source: "live" | "fixture";
};

export type LLMProvider = {
  id: string;
  complete(request: CompleteRequest): Promise<CompleteResponse>;
};
