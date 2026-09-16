import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedProject } from "@/lib/access";
import { executeEvalRun } from "@/lib/eval/runner";
import { HttpError, toErrorResponse } from "@/lib/errors";
import { runSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Sign in required");

    const { id: projectId } = await context.params;
    await getOwnedProject(projectId, session.sub);

    const body: unknown = await request.json();
    const input = runSchema.parse(body);

    const dataset = await prisma.dataset.findFirst({
      where: { id: input.datasetId, projectId },
      include: { items: true },
    });
    if (!dataset) throw new HttpError(404, "NOT_FOUND", "Dataset not found");
    if (dataset.items.length === 0) {
      throw new HttpError(400, "EMPTY_DATASET", "Dataset has no items");
    }
    if (dataset.items.length > 200) {
      throw new HttpError(400, "DATASET_TOO_LARGE", "Runs are capped at 200 items in this demo");
    }

    const run = await prisma.evalRun.create({
      data: {
        projectId,
        datasetId: dataset.id,
        status: "PENDING",
        judgeEnabled: input.judgeEnabled,
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        models: {
          create: input.models.map((model) => ({
            provider: model.provider,
            modelId: model.modelId,
          })),
        },
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          await executeEvalRun({
            runId: run.id,
            datasetItems: dataset.items,
            models: input.models,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
            judgeEnabled: input.judgeEnabled,
            onProgress: send,
          });
          await prisma.project.update({
            where: { id: projectId },
            data: { updatedAt: new Date() },
          });
        } catch (err) {
          send({
            type: "error",
            message: err instanceof Error ? err.message : "Eval failed",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
