export const MODEL_CATALOG = [
  {
    provider: "openai",
    modelId: "gpt-4o-mini",
    label: "OpenAI GPT-4o mini",
    hint: "Cheap, strong default",
  },
  {
    provider: "openai",
    modelId: "gpt-4.1-mini",
    label: "OpenAI GPT-4.1 mini",
    hint: "Higher quality, higher cost",
  },
  {
    provider: "groq",
    modelId: "llama-3.1-8b-instant",
    label: "Groq Llama 3.1 8B",
    hint: "Very fast",
  },
  {
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    label: "Groq Llama 3.3 70B",
    hint: "Strong open weights",
  },
  {
    provider: "ollama",
    modelId: "llama3.2",
    label: "Ollama Llama 3.2",
    hint: "Local, $0",
  },
  {
    provider: "ollama",
    modelId: "mistral",
    label: "Ollama Mistral",
    hint: "Local, $0",
  },
] as const;

export type CatalogModel = (typeof MODEL_CATALOG)[number];

export function isCatalogModel(provider: string, modelId: string): boolean {
  return MODEL_CATALOG.some((item) => item.provider === provider && item.modelId === modelId);
}

export function modelLabel(provider: string, modelId: string): string {
  const found = MODEL_CATALOG.find(
    (item) => item.provider === provider && item.modelId === modelId,
  );
  return found?.label ?? `${provider}/${modelId}`;
}
