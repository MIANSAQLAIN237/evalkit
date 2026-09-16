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
  const visible = tab === "failures" ? failures : filtered;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <FilterChip active={tag === "all"} onClick={() => setTag("all")}>
          All tags
        </FilterChip>
        {tags.map((item) => (
          <FilterChip key={item} active={tag === item} onClick={() => setTag(item)}>
            {item}
          </FilterChip>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
        {(["leaderboard", "failures", "all"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`min-h-11 rounded-lg px-2 py-1.5 text-xs capitalize sm:px-3 sm:text-sm ${
              tab === item ? "bg-emerald-400 text-zinc-950" : "bg-zinc-900 text-zinc-300"
            }`}
          >
            {item}
            {item === "failures" ? ` (${failures.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "leaderboard" ? (
        <>
          <div className="grid gap-3 md:hidden">
            {models.map((model, index) => (
              <article key={model.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {index === 0 ? <Badge tone="emerald">best exact</Badge> : null}
                  <p className="font-medium text-zinc-100">
                    {modelLabel(model.provider, model.modelId)}
                  </p>
                  <Badge tone={model.responseSource === "live" ? "sky" : "amber"}>
                    {model.responseSource}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-zinc-500">Exact</dt>
                    <dd className="font-mono">{formatPct(model.exactAccuracy)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Contains</dt>
                    <dd className="font-mono">{formatPct(model.containsAccuracy)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Judge</dt>
                    <dd className="font-mono">{model.avgJudgeScore.toFixed(2)} / 5</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Latency</dt>
                    <dd className="font-mono">{formatMs(model.avgLatencyMs)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-zinc-500">Cost</dt>
                    <dd className="font-mono">{formatUsd(model.costUsd)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-zinc-800 md:block">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Exact</th>
                  <th className="px-4 py-3">Contains</th>
                  <th className="px-4 py-3">Judge</th>
                  <th className="px-4 py-3">Latency</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model, index) => (
                  <tr key={model.id} className="border-t border-zinc-800">
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
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
        </>
      ) : null}

      {tab !== "leaderboard" ? (
        <div className="space-y-4">
          {visible.length === 0 ? (
            <p className="text-sm text-zinc-500">No cases in this view.</p>
          ) : null}
          {visible.map((row) => (
            <article key={row.id} className="min-w-0 rounded-2xl border border-zinc-800 bg-zinc-900/20 p-3 sm:p-4">
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
                <span className="font-mono text-xs text-zinc-500 sm:ml-auto">
                  {formatMs(row.latencyMs)}
                </span>
              </div>
              <p className="break-words text-sm text-zinc-300">
                <span className="text-zinc-500">Prompt · </span>
                {row.item.prompt}
              </p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="min-w-0 rounded-xl bg-zinc-950 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Expected</p>
                  <p className="whitespace-pre-wrap break-words font-mono text-sm text-emerald-200">
                    {row.item.expected}
                  </p>
                </div>
                <div className="min-w-0 rounded-xl bg-zinc-950 p-3">
                  <p className="mb-1 text-xs uppercase tracking-wide text-zinc-500">Model output</p>
                  <p className="whitespace-pre-wrap break-words font-mono text-sm text-zinc-100">
                    {row.error ?? row.output}
                  </p>
                </div>
              </div>
              {row.judgeReason ? (
                <p className="mt-3 break-words text-xs text-zinc-500">Judge: {row.judgeReason}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      className={`min-h-10 shrink-0 rounded-lg px-3 py-1.5 text-sm ${
        active ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-300"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
