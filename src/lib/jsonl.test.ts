import { describe, expect, it } from "vitest";
import { parseJsonl } from "./jsonl";

describe("parseJsonl", () => {
  it("parses prompt/expected/tags and skips blank lines", () => {
    const input = `
{"prompt":"2+2","expected":"4","tags":["math"]}

{"input":"capital of France","output":"Paris","tags":"geo, trivia"}
`.trim();

    const { items, errors } = parseJsonl(input);
    expect(errors).toEqual([]);
    expect(items).toEqual([
      { prompt: "2+2", expected: "4", tags: ["math"] },
      { prompt: "capital of France", expected: "Paris", tags: ["geo", "trivia"] },
    ]);
  });

  it("collects line-numbered errors and keeps valid rows", () => {
    const input = `{"prompt":"ok","expected":"yes"}\nnot-json\n{"prompt":"missing"}`;
    const { items, errors } = parseJsonl(input);
    expect(items).toHaveLength(1);
    expect(errors.map((e) => e.line)).toEqual([2, 3]);
  });
});
