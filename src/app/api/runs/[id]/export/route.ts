import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { csvEscape, getOwnedRun } from "@/lib/access";
import { HttpError, toErrorResponse } from "@/lib/errors";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Sign in required");

    const { id } = await context.params;
    const format = new URL(request.url).searchParams.get("format") === "json" ? "json" : "csv";
    const run = await getOwnedRun(id, session.sub);

    const results = await prisma.evalResult.findMany({
      where: { runId: id },
      include: {
        item: true,
        runModel: true,
      },
      orderBy: [{ runModelId: "asc" }, { itemId: "asc" }],
    });

    if (format === "json") {
      return Response.json({
        run: {
          id: run.id,
          status: run.status,
          judgeMode: run.judgeMode,
          createdAt: run.createdAt,
          dataset: run.dataset.name,
          models: run.models,
        },
        results: results.map((row) => ({
          model: `${row.runModel.provider}/${row.runModel.modelId}`,
          prompt: row.item.prompt,
          expected: row.item.expected,
          tags: row.item.tags,
          output: row.output,
          exactMatch: row.exactMatch,
          containsMatch: row.containsMatch,
          judgeScore: row.judgeScore,
          judgeReason: row.judgeReason,
          latencyMs: row.latencyMs,
          costUsd: row.costUsd,
          error: row.error,
        })),
      });
    }

    const header = [
      "model",
      "prompt",
      "expected",
      "output",
      "tags",
      "exact_match",
      "contains_match",
      "judge_score",
      "judge_reason",
      "latency_ms",
      "cost_usd",
      "error",
    ];

    const lines = [
      header.join(","),
      ...results.map((row) =>
        [
          csvEscape(`${row.runModel.provider}/${row.runModel.modelId}`),
          csvEscape(row.item.prompt),
          csvEscape(row.item.expected),
          csvEscape(row.output),
          csvEscape(row.item.tags.join("|")),
          String(row.exactMatch),
          String(row.containsMatch),
          row.judgeScore ?? "",
          csvEscape(row.judgeReason ?? ""),
          String(row.latencyMs),
          String(row.costUsd),
          csvEscape(row.error ?? ""),
        ].join(","),
      ),
    ];

    return new Response(lines.join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="evalkit-${run.id}.csv"`,
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
