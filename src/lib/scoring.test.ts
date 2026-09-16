import { describe, expect, it } from "vitest";
import {
  clampJudgeScore,
  containsMatch,
  exactMatch,
  heuristicJudge,
  normalizeText,
  tokenF1,
} from "./scoring";

describe("normalizeText", () => {
  it("trims, lowercases, and collapses whitespace", () => {
    expect(normalizeText("  Hello   WORLD ")).toBe("hello world");
  });
});

describe("exactMatch", () => {
  it("ignores case and extra spaces", () => {
    expect(exactMatch("  Paris ", "paris")).toBe(true);
  });

  it("rejects different answers", () => {
    expect(exactMatch("London", "Paris")).toBe(false);
  });
});

describe("containsMatch", () => {
  it("passes when expected is a substring", () => {
    expect(containsMatch("The answer is 408.", "408")).toBe(true);
  });

  it("fails on empty expected", () => {
    expect(containsMatch("anything", "   ")).toBe(false);
  });
});

describe("tokenF1", () => {
  it("is 1.0 for equivalent phrasing minus stop words", () => {
    expect(tokenF1("the capital of France is Paris", "Paris is the capital of France")).toBeGreaterThan(0.9);
  });

  it("is 0.0 for unrelated strings", () => {
    expect(tokenF1("banana", "4096")).toBe(0);
  });
});

describe("heuristicJudge", () => {
  it("scores exact matches as 5", () => {
    expect(heuristicJudge("30 days", "30 days").score).toBe(5);
  });

  it("scores contained answers as 4", () => {
    expect(heuristicJudge("Refunds are accepted within 30 days.", "30 days").score).toBe(4);
  });

  it("scores empty output as 1", () => {
    expect(heuristicJudge("   ", "12").score).toBe(1);
  });
});

describe("clampJudgeScore", () => {
  it("keeps scores in 1-5", () => {
    expect(clampJudgeScore(0)).toBe(1);
    expect(clampJudgeScore(9.7)).toBe(5);
    expect(clampJudgeScore(3.2)).toBe(3);
  });
});
