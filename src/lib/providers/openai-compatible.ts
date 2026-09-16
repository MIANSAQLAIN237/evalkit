import { estimateTokens } from "@/lib/pricing";
import type { CompleteRequest, CompleteResponse, LLMProvider } from "./types";

export function createOpenAICompatible(options: {
  id: string;
  baseUrl: string;
  apiKey: string;
}): LLMProvider {
  return {
    id: options.id,
    async complete(request: CompleteRequest): Promise<CompleteResponse> {
      const started = Date.now();
      const response = await fetch(`${options.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: request.modelId,
          temperature: request.temperature,
          max_tokens: request.maxTokens,
          messages: [{ role: "user", content: request.prompt }],
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`${options.id} ${response.status}: ${body.slice(0, 280)}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string | null } }>;
        usage?: { prompt_tokens?: number; completion_tokens?: number };
      };

      const text = data.choices?.[0]?.message?.content?.trim() ?? "";

      return {
        text,
        inputTokens: data.usage?.prompt_tokens ?? estimateTokens(request.prompt),
        outputTokens: data.usage?.completion_tokens ?? estimateTokens(text),
        latencyMs: Date.now() - started,
        source: "live",
      };
    },
  };
}
