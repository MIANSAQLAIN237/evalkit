import { z } from "zod";
import { isCatalogModel } from "@/lib/models";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(320)
    .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(320),
  password: z.string().min(1).max(72),
});

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  description: z.string().trim().max(280).default(""),
});

export const datasetSchema = z.object({
  name: z.string().trim().min(2).max(80),
  jsonl: z.string().min(2, "Paste or upload a JSONL dataset").max(1_500_000),
});

export const runSchema = z
  .object({
    datasetId: z.string().min(1),
    models: z
      .array(
        z.object({
          provider: z.enum(["openai", "groq", "ollama"]),
          modelId: z.string().min(1).max(80),
        }),
      )
      .min(1, "Pick at least one model")
      .max(3, "Pick at most three models"),
    judgeEnabled: z.boolean().default(true),
    temperature: z.number().min(0).max(1).default(0),
    maxTokens: z.number().int().min(16).max(2048).default(512),
  })
  .superRefine((value, ctx) => {
    for (const model of value.models) {
      if (!isCatalogModel(model.provider, model.modelId)) {
        ctx.addIssue({
          code: "custom",
          message: `Unknown model ${model.provider}/${model.modelId}`,
          path: ["models"],
        });
      }
    }
    const keys = new Set(value.models.map((model) => `${model.provider}:${model.modelId}`));
    if (keys.size !== value.models.length) {
      ctx.addIssue({
        code: "custom",
        message: "Duplicate models are not allowed",
        path: ["models"],
      });
    }
  });
