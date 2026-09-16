import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/format";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-emerald-400 text-zinc-950 hover:bg-emerald-300 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]",
  secondary:
    "bg-zinc-900 text-zinc-100 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800",
  ghost: "text-zinc-300 hover:bg-zinc-900",
  danger: "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20",
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
