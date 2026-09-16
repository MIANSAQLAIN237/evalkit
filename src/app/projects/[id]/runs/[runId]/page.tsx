import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RunResults } from "@/components/run-results";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Stat } from "@/components/ui/chrome";
import { requireUserOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPct, formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string; runId: string }>;
}) {
  const session = await requireUserOrRedirect();
  const { id, runId } = await params;

  const run = await prisma.evalRun.findFirst({
    where: { id: runId, projectId: id, project: { userId: session.sub } },
    include: {
      project: true,
      dataset: true,
      models: { orderBy: { exactAccuracy: "desc" } },
      results: {
        include: {
          item: true,
          runModel: true,
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!run) notFound();

  const totalCost = run.models.reduce((sum, model) => sum + model.costUsd, 0);
  const best = run.models[0];

  return (
    <AppShell name={session.name}>
      <PageHeader
        eyebrow={run.project.name}
        title="Eval results"
        description={`${run.dataset.name} · ${run.results.length} scored answers · judge: ${run.judgeMode}`}
        actions={
          <>
            <a href={`/api/runs/${run.id}/export?format=csv`}>
              <Button variant="secondary">Export CSV</Button>
            </a>
            <a href={`/api/runs/${run.id}/export?format=json`}>
              <Button variant="secondary">Export JSON</Button>
            </a>
            <Link href={`/projects/${run.projectId}`}>
              <Button variant="ghost">Back to project</Button>
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge
          tone={
            run.status === "COMPLETED" ? "emerald" : run.status === "FAILED" ? "rose" : "amber"
          }
        >
          {run.status.toLowerCase()}
        </Badge>
        <Badge tone="zinc">temp {run.temperature}</Badge>
        <Badge tone="zinc">max tokens {run.maxTokens}</Badge>
      </div>

      {run.error ? (
        <p className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {run.error}
        </p>
      ) : null}

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <Stat label="Best exact" value={best ? formatPct(best.exactAccuracy) : "—"} hint={best?.modelId} />
        <Stat label="Best judge" value={best ? `${best.avgJudgeScore.toFixed(2)} / 5` : "—"} />
        <Stat label="Total cost" value={formatUsd(totalCost)} />
      </div>

      <RunResults models={run.models} results={run.results} />
    </AppShell>
  );
}
