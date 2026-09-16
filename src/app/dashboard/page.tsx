import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CreateProjectForm } from "@/components/project-forms";
import { EmptyState, PageHeader } from "@/components/ui/chrome";
import { requireUserOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireUserOrRedirect();
  const projects = await prisma.project.findMany({
    where: { userId: session.sub },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { datasets: true, runs: true } } },
  });

  return (
    <AppShell name={session.name}>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Each project holds datasets, eval runs, and a leaderboard."
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          body="Create a project, import JSONL, and run your first model comparison."
        />
      ) : (
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 transition hover:border-emerald-400/30"
            >
              <h2 className="text-lg font-medium text-zinc-50">{project.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                {project.description || "No description"}
              </p>
              <p className="mt-4 font-mono text-xs text-zinc-500">
                {project._count.datasets} datasets · {project._count.runs} runs
              </p>
            </Link>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-sm font-medium text-zinc-300">New project</h2>
      <CreateProjectForm />
    </AppShell>
  );
}
