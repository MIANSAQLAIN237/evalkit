import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedProject } from "@/lib/access";
import { HttpError, toErrorResponse } from "@/lib/errors";
import { parseJsonl } from "@/lib/jsonl";
import { datasetSchema } from "@/lib/schemas";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Sign in required");

    const { id } = await context.params;
    await getOwnedProject(id, session.sub);

    const body: unknown = await request.json();
    const input = datasetSchema.parse(body);
    const { items, errors } = parseJsonl(input.jsonl);

    if (items.length === 0) {
      throw new HttpError(400, "EMPTY_DATASET", errors[0]?.message ?? "No valid JSONL rows");
    }

    const dataset = await prisma.$transaction(async (tx) => {
      const created = await tx.dataset.create({
        data: {
          projectId: id,
          name: input.name,
          itemCount: items.length,
        },
      });

      await tx.datasetItem.createMany({
        data: items.map((item) => ({
          datasetId: created.id,
          prompt: item.prompt,
          expected: item.expected,
          tags: item.tags,
        })),
      });

      await tx.project.update({
        where: { id },
        data: { updatedAt: new Date() },
      });

      return created;
    });

    return Response.json(
      {
        dataset,
        imported: items.length,
        skipped: errors.length,
        errors: errors.slice(0, 20),
      },
      { status: 201 },
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}
