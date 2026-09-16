import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function Badge({
  children,
  tone = "zinc",
}: {
  children: ReactNode;
  tone?: "zinc" | "emerald" | "rose" | "amber" | "sky";
}) {
  const tones = {
    zinc: "bg-zinc-800 text-zinc-300",
    emerald: "bg-emerald-400/10 text-emerald-300",
    rose: "bg-rose-400/10 text-rose-300",
    amber: "bg-amber-400/10 text-amber-200",
    sky: "bg-sky-400/10 text-sky-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
