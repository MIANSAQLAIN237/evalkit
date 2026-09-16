export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function formatUsd(value: number): string {
  if (value === 0) return "$0";
  if (value < 0.01) return `$${value.toFixed(4)}`;
  return `$${value.toFixed(2)}`;
}

export function formatMs(value: number): string {
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatTokens(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
