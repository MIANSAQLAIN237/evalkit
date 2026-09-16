import { prisma } from "@/lib/db";
import { HttpError } from "@/lib/errors";

export async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
  });
  if (!project) {
    throw new HttpError(404, "NOT_FOUND", "Project not found");
  }
  return project;
}

export async function getOwnedRun(runId: string, userId: string) {
  const run = await prisma.evalRun.findFirst({
    where: { id: runId, project: { userId } },
    include: {
      project: true,
      dataset: true,
      models: { orderBy: { exactAccuracy: "desc" } },
    },
  });
  if (!run) {
    throw new HttpError(404, "NOT_FOUND", "Run not found");
  }
  return run;
}

export function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
