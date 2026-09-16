import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 px-4 py-10 text-center sm:px-6 sm:py-12">
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-400/80 sm:text-xs">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="break-words text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="grid w-full grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:flex-wrap [&>a]:w-full [&>a]:sm:w-auto [&>button]:w-full [&>button]:sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 sm:p-4">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500 sm:text-xs">{label}</p>
      <p className="mt-1 truncate font-mono text-lg text-zinc-50 sm:text-xl">{value}</p>
      {hint ? <p className="mt-1 truncate text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
