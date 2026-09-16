import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedProject } from "@/lib/access";
import { HttpError, toErrorResponse } from "@/lib/errors";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Sign in required");

    const { id } = await context.params;
    await getOwnedProject(id, session.sub);
    await prisma.project.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (err) {
    return toErrorResponse(err);
  }
}
