import { estimateTokens } from "@/lib/pricing";
import type { CompleteRequest, CompleteResponse } from "./types";

function hash32(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function strength(modelId: string): number {
  if (modelId.includes("gpt-4.1") || modelId.includes("70b")) return 2;
  if (modelId.includes("gpt-4o") || modelId.includes("mistral")) return 1;
  return 0;
}

export function fixtureAnswer(modelId: string, prompt: string, expected: string): string {
  const bucket = hash32(`${modelId}:${prompt}`) % 10;
  const exactCutoff = 4 + strength(modelId) * 2;

  if (bucket < exactCutoff) return expected;
  if (bucket < exactCutoff + 1) return `The answer is ${expected}.`;
  if (bucket < 9) return expected.split(" ").slice(0, 1).join(" ") || "Unknown";
  return "I do not know.";
}

export function fixtureComplete(
  request: CompleteRequest,
  expected: string,
): CompleteResponse {
  const started = Date.now();
  const text = fixtureAnswer(request.modelId, request.prompt, expected);
  const jitter = hash32(request.modelId) % 180;

  return {
    text,
    inputTokens: estimateTokens(request.prompt),
    outputTokens: estimateTokens(text),
    latencyMs: 40 + jitter + (Date.now() - started),
    source: "fixture",
  };
}

export const fixtureProvider = {
  id: "fixture",
  complete(request: CompleteRequest): Promise<CompleteResponse> {
    return Promise.resolve(fixtureComplete(request, ""));
  },
};
