export type DatasetRow = {
  prompt: string;
  expected: string;
  tags: string[];
};

export type ParseIssue = {
  line: number;
  message: string;
};

const MAX_ITEMS = 500;
const MAX_PROMPT_CHARS = 20_000;
const MAX_EXPECTED_CHARS = 8_000;

export function parseJsonl(text: string): { items: DatasetRow[]; errors: ParseIssue[] } {
  const items: DatasetRow[] = [];
  const errors: ParseIssue[] = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]?.trim() ?? "";
    if (!line) continue;

    try {
      const parsed: unknown = JSON.parse(line);
      const row = coerceRow(parsed);
      items.push(row);
    } catch (err) {
      errors.push({
        line: i + 1,
        message: err instanceof Error ? err.message : "Invalid JSON line",
      });
    }

    if (items.length > MAX_ITEMS) {
      errors.push({ line: i + 1, message: `Dataset exceeds ${MAX_ITEMS} items` });
      break;
    }
  }

  return { items, errors };
}

function coerceRow(value: unknown): DatasetRow {
  if (!value || typeof value !== "object") {
    throw new Error("Line must be a JSON object");
  }

  const record = value as Record<string, unknown>;
  const prompt = asNonEmptyString(record.prompt ?? record.input, "prompt");
  const expected = asNonEmptyString(
    record.expected ?? record.output ?? record.answer,
    "expected",
  );

  if (prompt.length > MAX_PROMPT_CHARS) {
    throw new Error(`prompt is longer than ${MAX_PROMPT_CHARS} characters`);
  }
  if (expected.length > MAX_EXPECTED_CHARS) {
    throw new Error(`expected is longer than ${MAX_EXPECTED_CHARS} characters`);
  }

  const tags = normalizeTags(record.tags);
  return { prompt, expected, tags };
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing ${field}`);
  }
  return value.trim();
}

function normalizeTags(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  }
  if (Array.isArray(value)) {
    return value
      .filter((tag): tag is string => typeof tag === "string")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  }
  throw new Error("tags must be a string or an array of strings");
}

export function toJsonl(items: DatasetRow[]): string {
  return items.map((item) => JSON.stringify(item)).join("\n") + "\n";
}
