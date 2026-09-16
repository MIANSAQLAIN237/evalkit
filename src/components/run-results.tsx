"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatMs, formatPct, formatUsd } from "@/lib/format";
import { modelLabel } from "@/lib/models";

type ModelRow = {
  id: string;
  provider: string;
  modelId: string;
  responseSource: string;
  exactAccuracy: number;
  containsAccuracy: number;
  avgJudgeScore: number;
  avgLatencyMs: number;
  costUsd: number;
  errorCount: number;
};

type ResultRow = {
  id: string;
  exactMatch: boolean;
  containsMatch: boolean;
  judgeScore: number | null;
  judgeReason: string | null;
  output: string;
  latencyMs: number;
  error: string | null;
  item: { prompt: string; expected: string; tags: string[] };
  runModel: { provider: string; modelId: string };
};

export function RunResults({
  models,
  results,
}: {
  models: ModelRow[];
  results: ResultRow[];
}) {
  const tags = useMemo(() => {
    const set = new Set<string>();
    for (const row of results) {
      for (const tag of row.item.tags) set.add(tag);
    }
    return [...set].sort();
  }, [results]);

  const [tag, setTag] = useState("all");
  const [tab, setTab] = useState<"leaderboard" | "failures" | "all">("leaderboard");

  const filtered = results.filter((row) => tag === "all" || row.item.tags.includes(tag));
  const failures = filtered.filter((row) => !row.exactMatch);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          className={`rounded-lg px-3 py-1.5 text-sm ${tag === "all" ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-300"}`}
          onClick={() => setTag("all")}
        >
          All tags
        </button>
        {tags.map((item) => (
          <button
            key={item}
            className={`rounded-lg px-3 py-1.5 text-sm ${tag === item ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-300"}`}
            onClick={() => setTag(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        {(["leaderboard", "failures", "all"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-lg px-3 py-1.5 text-sm capitalize ${
              tab === item ? "bg-emerald-400 text-zinc-950" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            {item}
            {item === "failures" ? ` (${failures.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "leaderboard" ? (
        <div className="overflow-x-auto rounded-2xl border border-zinc-800">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Exact</th>
                <th className="px-4 py-3">Contains</th>
                <th className="px-4 py-3">Judge</th>
                <th className="px-4 py-3">pAvg latency</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, index) => (
                <tr key={model.id} className="border-t border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {index === 0 ? <Badge tone="emerald">best exact</Badge> : null}
                      <span>{modelLabel(model.provider, model.modelId)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">{formatPct(model.exactAccuracy)}</td>
                  <td className="px-4 py-3 font-mono">{formatPct(model.containsAccuracy)}</td>
                  <td className="px-4 py-3 font-mono">{model.avgJudgeScore.toFixed(2)} / 5</td>
                  <td className="px-4 py-3 font-mono">{formatMs(model.avgLatencyMs)}</td>
                  <td className="px-4 py-3 font-mono">{formatUsd(model.costUsd)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={model.responseSource === "live" ? "sky" : "amber"}>
                      {model.responseSource}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab !== "leaderboard" ? (
        <div className="space-y-4">
          {(tab === "failures" ? failures : filtered).length === 0 ? (
            <p className="text-sm text-zinc-500">No cases in this view.</p>
          ) : null}
          {(tab === "failures" ? failures : filtered).map((row) => (
            <article key={row.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>{modelLabel(row.runModel.provider, row.runModel.modelId)}</Badge>
                {row.item.tags.map((item) => (
                  <Badge key={item} tone="zinc">
                    {item}
                  </Badge>
                ))}
                <Badge tone={row.exactMatch ? "emerald" : "rose"}>
                  {row.exactMatch ? "exact" : "miss"}
                </Badge>
                <Badge tone={row.containsMatch ? "emerald" : "zinc"}>
                  {row.containsMatch ? "contains" : "no contain"}
                </Badge>
                {row.judgeScore != null ? <Badge tone="sky">judge {row.judgeScore}/5</Badge> : null}
                <span className="ml-auto font-mono text-xs text-zinc-500">{formatMs(row.latencyMs)}</span>
              </div>
              <p className="text-sm text-zinc-300">
                <span className="text-zinc-500">Prompt · </span>
                {row.item.prompt}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-zinc-950 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Expected</p>
                  <p className="whitespace-pre-wrap font-mono text-sm text-emerald-200">{row.item.expected}</p>
                </div>
                <div className="rounded-xl bg-zinc-950 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Model output</p>
                  <p className="whitespace-pre-wrap font-mono text-sm text-zinc-100">
                    {row.error ?? row.output}
                  </p>
                </div>
              </div>
              {row.judgeReason ? (
                <p className="mt-3 text-xs text-zinc-500">Judge: {row.judgeReason}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
