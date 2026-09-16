import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, toErrorResponse } from "@/lib/errors";
import { projectSchema } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Sign in required");

    const projects = await prisma.project.findMany({
      where: { userId: session.sub },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { datasets: true, runs: true } },
      },
    });

    return Response.json({ projects });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) throw new HttpError(401, "UNAUTHENTICATED", "Sign in required");

    const body: unknown = await request.json();
    const input = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        userId: session.sub,
        name: input.name,
        description: input.description,
      },
    });

    return Response.json({ project }, { status: 201 });
  } catch (err) {
    return toErrorResponse(err);
  }
}
