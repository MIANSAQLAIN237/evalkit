const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "is",
  "are",
  "to",
  "of",
  "and",
  "or",
  "for",
  "in",
  "on",
  "at",
]);

export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function exactMatch(output: string, expected: string): boolean {
  return normalizeText(output) === normalizeText(expected);
}

export function containsMatch(output: string, expected: string): boolean {
  const expectedNorm = normalizeText(expected);
  if (!expectedNorm) return false;
  return normalizeText(output).includes(expectedNorm);
}

export function tokenize(value: string): string[] {
  return normalizeText(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(" ")
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));
}

export function tokenF1(output: string, expected: string): number {
  const predicted = tokenize(output);
  const gold = tokenize(expected);

  if (gold.length === 0) {
    return predicted.length === 0 ? 1 : 0;
  }

  const remaining = new Map<string, number>();
  for (const token of predicted) {
    remaining.set(token, (remaining.get(token) ?? 0) + 1);
  }

  let overlap = 0;
  for (const token of gold) {
    const count = remaining.get(token) ?? 0;
    if (count > 0) {
      overlap += 1;
      remaining.set(token, count - 1);
    }
  }

  const precision = predicted.length === 0 ? 0 : overlap / predicted.length;
  const recall = overlap / gold.length;
  if (precision + recall === 0) return 0;
  return (2 * precision * recall) / (precision + recall);
}

export function heuristicJudge(
  output: string,
  expected: string,
): { score: number; reason: string } {
  if (!output.trim()) {
    return { score: 1, reason: "Empty model output." };
  }
  if (exactMatch(output, expected)) {
    return { score: 5, reason: "Exact match after normalization." };
  }
  if (containsMatch(output, expected)) {
    return { score: 4, reason: "Expected answer is contained in the output." };
  }

  const f1 = tokenF1(output, expected);
  if (f1 >= 0.7) {
    return { score: 3, reason: `High token overlap (F1 ${f1.toFixed(2)}).` };
  }
  if (f1 >= 0.3) {
    return { score: 2, reason: `Partial token overlap (F1 ${f1.toFixed(2)}).` };
  }
  return { score: 1, reason: `Low token overlap (F1 ${f1.toFixed(2)}).` };
}

export function clampJudgeScore(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}
