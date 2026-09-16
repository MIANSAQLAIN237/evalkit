export type Price = {
  inputPerMillion: number;
  outputPerMillion: number;
};

const PRICES: Record<string, Price> = {
  "openai:gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "openai:gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "groq:llama-3.1-8b-instant": { inputPerMillion: 0.05, outputPerMillion: 0.08 },
  "groq:llama-3.3-70b-versatile": { inputPerMillion: 0.59, outputPerMillion: 0.79 },
  "ollama:llama3.2": { inputPerMillion: 0, outputPerMillion: 0 },
  "ollama:mistral": { inputPerMillion: 0, outputPerMillion: 0 },
};

export function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateCost(
  provider: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const price =
    PRICES[`${provider}:${modelId}`] ?? {
      inputPerMillion: 0.15,
      outputPerMillion: 0.6,
    };

  const cost =
    (inputTokens / 1_000_000) * price.inputPerMillion +
    (outputTokens / 1_000_000) * price.outputPerMillion;

  return Math.round(cost * 1_000_000) / 1_000_000;
}
