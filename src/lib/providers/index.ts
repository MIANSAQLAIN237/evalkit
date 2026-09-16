import { fixtureComplete } from "./fixture";
import { createOpenAICompatible } from "./openai-compatible";
import type { CompleteRequest, CompleteResponse } from "./types";

function openaiProvider() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return createOpenAICompatible({
    id: "openai",
    baseUrl: "https://api.openai.com/v1",
    apiKey,
  });
}

function groqProvider() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;
  return createOpenAICompatible({
    id: "groq",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKey,
  });
}

function ollamaProvider() {
  const baseUrl = (process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434") + "/v1";
  return createOpenAICompatible({
    id: "ollama",
    baseUrl,
    apiKey: "ollama",
  });
}

export async function completeWithFallback(
  request: CompleteRequest,
  expected: string,
): Promise<CompleteResponse> {
  const live =
    request.provider === "openai"
      ? openaiProvider()
      : request.provider === "groq"
        ? groqProvider()
        : request.provider === "ollama"
          ? ollamaProvider()
          : null;

  if (!live) {
    return fixtureComplete(request, expected);
  }

  try {
    return await live.complete(request);
  } catch (err) {
    console.warn(`Provider ${request.provider} failed, using fixture`, err);
    return fixtureComplete(request, expected);
  }
}

export function providerStatus() {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY?.trim()),
    groq: Boolean(process.env.GROQ_API_KEY?.trim()),
    ollama: Boolean(process.env.OLLAMA_BASE_URL?.trim()),
  };
}
