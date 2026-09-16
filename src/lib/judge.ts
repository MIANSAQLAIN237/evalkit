import { clampJudgeScore, heuristicJudge } from "@/lib/scoring";
import { completeWithFallback } from "@/lib/providers";

const JUDGE_INSTRUCTIONS = `You are a strict but fair grader for an LLM evaluation harness.
Score how well OUTPUT matches EXPECTED on a 1-5 integer scale.
5 = semantically equivalent
4 = correct, with extra fluff
3 = partially correct
2 = related but wrong
1 = incorrect or empty
Return ONLY JSON: {"score":n,"reason":"one sentence"}`;

export async function judgeOutput(options: {
  output: string;
  expected: string;
  preferLive: boolean;
}): Promise<{ score: number; reason: string; mode: "llm" | "heuristic" }> {
  const fallback = heuristicJudge(options.output, options.expected);
  if (!options.preferLive) {
    return { ...fallback, mode: "heuristic" };
  }

  try {
    const result = await completeWithFallback(
      {
        provider: process.env.OPENAI_API_KEY ? "openai" : process.env.GROQ_API_KEY ? "groq" : "openai",
        modelId: process.env.OPENAI_API_KEY ? "gpt-4o-mini" : "llama-3.1-8b-instant",
        prompt: `${JUDGE_INSTRUCTIONS}\n\nEXPECTED:\n${options.expected}\n\nOUTPUT:\n${options.output}`,
        temperature: 0,
        maxTokens: 120,
      },
      JSON.stringify(fallback),
    );

    if (result.source === "fixture") {
      return { ...fallback, mode: "heuristic" };
    }

    const parsed = extractJudgeJson(result.text);
    if (!parsed) return { ...fallback, mode: "heuristic" };
    return {
      score: clampJudgeScore(parsed.score),
      reason: parsed.reason.slice(0, 280),
      mode: "llm",
    };
  } catch {
    return { ...fallback, mode: "heuristic" };
  }
}

function extractJudgeJson(text: string): { score: number; reason: string } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed: unknown = JSON.parse(match[0]);
    if (!parsed || typeof parsed !== "object") return null;
    const record = parsed as { score?: unknown; reason?: unknown };
    if (typeof record.score !== "number") return null;
    return {
      score: record.score,
      reason: typeof record.reason === "string" ? record.reason : "No reason provided.",
    };
  } catch {
    return null;
  }
}
