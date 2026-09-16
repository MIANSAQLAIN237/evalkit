import Link from "next/link";
import { cn } from "@/lib/format";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-400 text-xs font-bold text-zinc-950">
        Ek
      </span>
      <span>Evalkit</span>
    </Link>
  );
}
