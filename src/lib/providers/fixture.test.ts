import { describe, expect, it } from "vitest";
import { fixtureAnswer } from "./fixture";

describe("fixtureAnswer", () => {
  it("is deterministic for the same model and prompt", () => {
    const a = fixtureAnswer("gpt-4o-mini", "What is 2+2?", "4");
    const b = fixtureAnswer("gpt-4o-mini", "What is 2+2?", "4");
    expect(a).toBe(b);
  });

  it("can differ across models so leaderboards are not identical", () => {
    const prompt = "What is the capital of France?";
    const strong = fixtureAnswer("gpt-4.1-mini", prompt, "Paris");
    const weak = fixtureAnswer("llama3.2", prompt, "Paris");
    expect(typeof strong).toBe("string");
    expect(typeof weak).toBe("string");
  });
});
