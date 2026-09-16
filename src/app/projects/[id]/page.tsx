import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteProjectButton } from "@/components/actions";
import { AppShell } from "@/components/app-shell";
import { UploadDatasetForm } from "@/components/project-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader, Stat } from "@/components/ui/chrome";
import { requireUserOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatPct } from "@/lib/format";
import { modelLabel } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUserOrRedirect();
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: session.sub },
    include: {
      datasets: { orderBy: { createdAt: "desc" } },
      runs: {
        orderBy: { createdAt: "desc" },
        include: { models: { orderBy: { exactAccuracy: "desc" } }, dataset: true },
      },
    },
  });

  if (!project) notFound();

  const latest = project.runs[0];
  const itemCount = project.datasets.reduce((sum, dataset) => sum + dataset.itemCount, 0);

  return (
    <AppShell name={session.name}>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={project.description || "Eval project"}
        actions={
          <>
            <Link href={`/projects/${project.id}/run`}>
              <Button>Run eval</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">All projects</Button>
            </Link>
            <DeleteProjectButton projectId={project.id} />
          </>
        }
      />

      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <Stat label="Datasets" value={String(project.datasets.length)} />
        <Stat label="Items" value={String(itemCount)} />
        <Stat
          label="Latest exact"
          value={latest?.models[0] ? formatPct(latest.models[0].exactAccuracy) : "—"}
          hint={latest?.models[0] ? modelLabel(latest.models[0].provider, latest.models[0].modelId) : "No runs yet"}
        />
      </div>

      <section className="mb-12">
        <h2 className="mb-3 text-sm font-medium text-zinc-300">Runs</h2>
        {project.runs.length === 0 ? (
          <p className="text-sm text-zinc-500">No runs yet. Import a dataset, then start an eval.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Dataset</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Best exact</th>
                  <th className="px-4 py-3">Models</th>
                </tr>
              </thead>
              <tbody>
                {project.runs.map((run) => (
                  <tr key={run.id} className="border-t border-zinc-800">
                    <td className="px-4 py-3">
                      <Link href={`/projects/${project.id}/runs/${run.id}`} className="text-emerald-300 hover:underline">
                        {run.createdAt.toLocaleString()}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{run.dataset.name}</td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          run.status === "COMPLETED"
                            ? "emerald"
                            : run.status === "FAILED"
                              ? "rose"
                              : "amber"
                        }
                      >
                        {run.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {run.models[0] ? formatPct(run.models[0].exactAccuracy) : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {run.models.map((model) => model.modelId).join(" · ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Datasets</h2>
          {project.datasets.length === 0 ? (
            <p className="text-sm text-zinc-500">Upload JSONL to get started.</p>
          ) : (
            <ul className="space-y-2">
              {project.datasets.map((dataset) => (
                <li
                  key={dataset.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                >
                  <span>{dataset.name}</span>
                  <span className="font-mono text-xs text-zinc-500">{dataset.itemCount} items</span>
                </li>
              ))}
            </ul>
          )}
          </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-300">Import JSONL</h2>
          <UploadDatasetForm projectId={project.id} />
          <p className="mt-3 text-xs text-zinc-500">
            Sample file:{" "}
            <a className="text-emerald-400 hover:underline" href="/sample-eval.jsonl" download>
              sample-eval.jsonl
            </a>
          </p>
        </div>
      </section>
    </AppShell>
  );
}
