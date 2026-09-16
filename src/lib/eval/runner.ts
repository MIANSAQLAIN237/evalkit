import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/errors";
import { mapPool, withTimeout } from "@/lib/async";
import { judgeOutput } from "@/lib/judge";
import { estimateCost } from "@/lib/pricing";
import { completeWithFallback } from "@/lib/providers";
import { containsMatch, exactMatch } from "@/lib/scoring";
import type { CompleteResponse } from "@/lib/providers/types";

export type RunModelInput = {
  provider: string;
  modelId: string;
};

export type RunProgressEvent =
  | { type: "start"; runId: string; total: number }
  | { type: "item"; runId: string; completed: number; total: number; modelId: string }
  | { type: "done"; runId: string }
  | { type: "error"; message: string };

type DatasetItem = {
  id: string;
  prompt: string;
  expected: string;
};

export async function executeEvalRun(options: {
  runId: string;
  datasetItems: DatasetItem[];
  models: RunModelInput[];
  temperature: number;
  maxTokens: number;
  judgeEnabled: boolean;
  onProgress?: (event: RunProgressEvent) => void;
}) {
  const { runId, datasetItems, models, temperature, maxTokens, judgeEnabled, onProgress } = options;
  const total = datasetItems.length * models.length;
  onProgress?.({ type: "start", runId, total });

  await prisma.evalRun.update({
    where: { id: runId },
    data: { status: "RUNNING" },
  });

  let completed = 0;
  let judgeMode: "heuristic" | "llm" = "heuristic";

  try {
    for (const model of models) {
      const runModel = await prisma.evalRunModel.findFirst({
        where: { runId, provider: model.provider, modelId: model.modelId },
      });
      if (!runModel) {
        throw new HttpError(500, "INTERNAL", "Run model row missing");
      }

      const sources = new Set<"live" | "fixture">();

      await mapPool(datasetItems, 3, async (item) => {
        let completion: CompleteResponse | null = null;
        let error: string | null = null;

        try {
          completion = await withTimeout(
            completeWithFallback(
              {
                provider: model.provider,
                modelId: model.modelId,
                prompt: item.prompt,
                temperature,
                maxTokens,
              },
              item.expected,
            ),
            25_000,
          );
          sources.add(completion.source);
        } catch (err) {
          error = err instanceof Error ? err.message : "Model call failed";
        }

        const output = completion?.text ?? "";
        const exact = !error && exactMatch(output, item.expected);
        const contains = !error && containsMatch(output, item.expected);
        let judgeScore: number | null = null;
        let judgeReason: string | null = null;

        if (!error && judgeEnabled) {
          const judged = await judgeOutput({
            output,
            expected: item.expected,
            preferLive: Boolean(process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY),
          });
          judgeScore = judged.score;
          judgeReason = judged.reason;
          if (judged.mode === "llm") judgeMode = "llm";
        }

        const inputTokens = completion?.inputTokens ?? 0;
        const outputTokens = completion?.outputTokens ?? 0;
        const costUsd = estimateCost(model.provider, model.modelId, inputTokens, outputTokens);

        await prisma.evalResult.create({
          data: {
            runId,
            runModelId: runModel.id,
            itemId: item.id,
            output,
            latencyMs: completion?.latencyMs ?? 0,
            inputTokens,
            outputTokens,
            costUsd,
            exactMatch: exact,
            containsMatch: contains,
            judgeScore,
            judgeReason,
            error,
          },
        });

        completed += 1;
        onProgress?.({
          type: "item",
          runId,
          completed,
          total,
          modelId: model.modelId,
        });
      });

      const rows = await prisma.evalResult.findMany({
        where: { runModelId: runModel.id },
      });
      const n = rows.length || 1;
      const ok = rows.filter((row) => !row.error);
      const source =
        sources.size === 0
          ? "fixture"
          : sources.size === 2
            ? "mixed"
            : sources.has("live")
              ? "live"
              : "fixture";

      await prisma.evalRunModel.update({
        where: { id: runModel.id },
        data: {
          responseSource: source,
          inputTokens: rows.reduce((sum, row) => sum + row.inputTokens, 0),
          outputTokens: rows.reduce((sum, row) => sum + row.outputTokens, 0),
          costUsd: rows.reduce((sum, row) => sum + row.costUsd, 0),
          avgLatencyMs: rows.reduce((sum, row) => sum + row.latencyMs, 0) / n,
          exactAccuracy: rows.filter((row) => row.exactMatch).length / n,
          containsAccuracy: rows.filter((row) => row.containsMatch).length / n,
          avgJudgeScore:
            ok.length === 0
              ? 0
              : ok.reduce((sum, row) => sum + (row.judgeScore ?? 0), 0) / ok.length,
          errorCount: rows.filter((row) => row.error).length,
        },
      });
    }

    await prisma.evalRun.update({
      where: { id: runId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        judgeMode,
      },
    });

    onProgress?.({ type: "done", runId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Eval failed";
    await prisma.evalRun.update({
      where: { id: runId },
      data: { status: "FAILED", error: message.slice(0, 500) },
    });
    onProgress?.({ type: "error", message });
    throw err;
  }
}
