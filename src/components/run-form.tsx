"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, readSse } from "@/lib/api-client";
import { MODEL_CATALOG } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { ErrorText } from "@/components/ui/field";

type DatasetOption = { id: string; name: string; itemCount: number };

export function RunForm({
  projectId,
  datasets,
}: {
  projectId: string;
  datasets: DatasetOption[];
}) {
  const router = useRouter();
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>(["openai:gpt-4o-mini", "groq:llama-3.1-8b-instant"]);
  const [judgeEnabled, setJudgeEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const models = useMemo(
    () =>
      MODEL_CATALOG.filter((item) => selected.includes(`${item.provider}:${item.modelId}`)).map(
        (item) => ({ provider: item.provider, modelId: item.modelId }),
      ),
    [selected],
  );

  function toggle(key: string) {
    setSelected((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= 3) return current;
      return [...current, key];
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setProgress("Starting eval…");

    try {
      const response = await api<Response>(`/api/projects/${projectId}/runs`, {
        method: "POST",
        body: JSON.stringify({
          datasetId,
          models,
          judgeEnabled,
          temperature: 0,
          maxTokens: 512,
        }),
      });

      let runId: string | null = null;
      await readSse(response, (event) => {
        if (event.type === "start") {
          runId = String(event.runId);
          setProgress(`Running 0/${String(event.total)}…`);
        }
        if (event.type === "item") {
          setProgress(`Scoring ${String(event.completed)}/${String(event.total)} (${String(event.modelId)})`);
        }
        if (event.type === "done") {
          runId = String(event.runId);
        }
        if (event.type === "error") {
          setError(String(event.message));
        }
      });

      if (runId) {
        router.push(`/projects/${projectId}/runs/${runId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Eval failed");
    } finally {
      setPending(false);
    }
  }

  if (datasets.length === 0) {
    return <p className="text-sm text-zinc-500">Upload a dataset before running an eval.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-zinc-200">Dataset</span>
        <select
          value={datasetId}
          onChange={(event) => setDatasetId(event.target.value)}
          className="min-h-11 w-full min-w-0 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-zinc-100"
        >
          {datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.name} ({dataset.itemCount} items)
            </option>
          ))}
        </select>
      </label>

      <div>
        <p className="text-sm font-medium text-zinc-200">Models (1–3)</p>
        <p className="mb-3 text-xs text-zinc-500">
          Missing API keys automatically fall back to deterministic fixtures so the demo still runs.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODEL_CATALOG.map((item) => {
            const key = `${item.provider}:${item.modelId}`;
            const checked = selected.includes(key);
            return (
              <label
                key={key}
                className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                  checked ? "border-emerald-400/40 bg-emerald-400/5" : "border-zinc-800 bg-zinc-950"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(key)}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium text-zinc-100">{item.label}</span>
                  <span className="text-xs text-zinc-500">{item.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <label className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
        <input
          type="checkbox"
          checked={judgeEnabled}
          onChange={(event) => setJudgeEnabled(event.target.checked)}
        />
        LLM-as-judge (1–5). Uses a live judge when an API key is set, otherwise a heuristic judge.
      </label>

      <ErrorText>{error}</ErrorText>
      {progress ? (
        <p className="break-all font-mono text-sm text-emerald-300">{progress}</p>
      ) : null}

      <Button type="submit" disabled={pending || models.length === 0} className="w-full sm:w-auto">
        {pending ? "Running eval…" : "Run eval"}
      </Button>
    </form>
  );
}
