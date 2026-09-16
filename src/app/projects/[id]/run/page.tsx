import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { RunForm } from "@/components/run-form";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/chrome";
import { requireUserOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireUserOrRedirect();
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: session.sub },
    include: { datasets: { orderBy: { createdAt: "desc" } } },
  });
  if (!project) notFound();

  return (
    <AppShell name={session.name}>
      <PageHeader
        eyebrow={project.name}
        title="Run eval"
        description="Pick a dataset and 1–3 models. Temperature is fixed at 0 for reproducibility."
        actions={
          <Link href={`/projects/${project.id}`}>
            <Button variant="secondary">Back</Button>
          </Link>
        }
      />
      <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6">
        <RunForm
          projectId={project.id}
          datasets={project.datasets.map((dataset) => ({
            id: dataset.id,
            name: dataset.name,
            itemCount: dataset.itemCount,
          }))}
        />
      </div>
    </AppShell>
  );
}
