import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { DEMO_DATASET, DEMO_EMAIL, DEMO_PASSWORD } from "../src/lib/demo-dataset";
import { estimateCost } from "../src/lib/pricing";
import { fixtureComplete } from "../src/lib/providers/fixture";
import { containsMatch, exactMatch, heuristicJudge } from "../src/lib/scoring";

config();

const prisma = new PrismaClient();

const SEED_MODELS = [
  { provider: "openai", modelId: "gpt-4o-mini" },
  { provider: "groq", modelId: "llama-3.1-8b-instant" },
  { provider: "ollama", modelId: "llama3.2" },
] as const;

async function main() {
  await prisma.user.deleteMany({ where: { email: DEMO_EMAIL } });

  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      name: "Evalkit Demo",
      passwordHash: await hash(DEMO_PASSWORD, 12),
    },
  });

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: "Reasoning Bench v1",
      description: "Seeded 30-item mix of math, coding, RAG, and reasoning prompts.",
    },
  });

  const dataset = await prisma.dataset.create({
    data: {
      projectId: project.id,
      name: "core-30",
      itemCount: DEMO_DATASET.length,
      items: {
        create: DEMO_DATASET,
      },
    },
    include: { items: true },
  });

  const run = await prisma.evalRun.create({
    data: {
      projectId: project.id,
      datasetId: dataset.id,
      status: "COMPLETED",
      judgeEnabled: true,
      judgeMode: "heuristic",
      temperature: 0,
      maxTokens: 512,
      completedAt: new Date(),
      models: {
        create: SEED_MODELS.map((model) => ({
          provider: model.provider,
          modelId: model.modelId,
          responseSource: "fixture",
        })),
      },
    },
    include: { models: true },
  });

  for (const runModel of run.models) {
    let inputTokens = 0;
    let outputTokens = 0;
    let costUsd = 0;
    let latencyTotal = 0;
    let exact = 0;
    let contains = 0;
    let judgeTotal = 0;

    for (const item of dataset.items) {
      const completion = fixtureComplete(
        {
          provider: runModel.provider,
          modelId: runModel.modelId,
          prompt: item.prompt,
          temperature: 0,
          maxTokens: 512,
        },
        item.expected,
      );
      const exactHit = exactMatch(completion.text, item.expected);
      const containsHit = containsMatch(completion.text, item.expected);
      const judged = heuristicJudge(completion.text, item.expected);
      const itemCost = estimateCost(
        runModel.provider,
        runModel.modelId,
        completion.inputTokens,
        completion.outputTokens,
      );

      await prisma.evalResult.create({
        data: {
          runId: run.id,
          runModelId: runModel.id,
          itemId: item.id,
          output: completion.text,
          latencyMs: completion.latencyMs,
          inputTokens: completion.inputTokens,
          outputTokens: completion.outputTokens,
          costUsd: itemCost,
          exactMatch: exactHit,
          containsMatch: containsHit,
          judgeScore: judged.score,
          judgeReason: judged.reason,
        },
      });

      inputTokens += completion.inputTokens;
      outputTokens += completion.outputTokens;
      costUsd += itemCost;
      latencyTotal += completion.latencyMs;
      if (exactHit) exact += 1;
      if (containsHit) contains += 1;
      judgeTotal += judged.score;
    }

    const n = dataset.items.length || 1;
    await prisma.evalRunModel.update({
      where: { id: runModel.id },
      data: {
        inputTokens,
        outputTokens,
        costUsd,
        avgLatencyMs: latencyTotal / n,
        exactAccuracy: exact / n,
        containsAccuracy: contains / n,
        avgJudgeScore: judgeTotal / n,
      },
    });
  }

  console.log("Seeded demo user", DEMO_EMAIL, "/", DEMO_PASSWORD);
  console.log("Open /dashboard after launching the demo or signing in.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
