-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetItem" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "DatasetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "judgeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "judgeMode" TEXT NOT NULL DEFAULT 'heuristic',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxTokens" INTEGER NOT NULL DEFAULT 512,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "EvalRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalRunModel" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "responseSource" TEXT NOT NULL DEFAULT 'fixture',
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgLatencyMs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exactAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "containsAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgJudgeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EvalRunModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "runModelId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "output" TEXT NOT NULL DEFAULT '',
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exactMatch" BOOLEAN NOT NULL DEFAULT false,
    "containsMatch" BOOLEAN NOT NULL DEFAULT false,
    "judgeScore" INTEGER,
    "judgeReason" TEXT,
    "error" TEXT,

    CONSTRAINT "EvalResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_updatedAt_idx" ON "Project"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Dataset_projectId_idx" ON "Dataset"("projectId");

-- CreateIndex
CREATE INDEX "DatasetItem_datasetId_idx" ON "DatasetItem"("datasetId");

-- CreateIndex
CREATE INDEX "EvalRun_projectId_createdAt_idx" ON "EvalRun"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "EvalRunModel_runId_idx" ON "EvalRunModel"("runId");

-- CreateIndex
CREATE INDEX "EvalResult_runId_exactMatch_idx" ON "EvalResult"("runId", "exactMatch");

-- CreateIndex
CREATE INDEX "EvalResult_runModelId_idx" ON "EvalResult"("runModelId");

-- CreateIndex
CREATE INDEX "EvalResult_itemId_idx" ON "EvalResult"("itemId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetItem" ADD CONSTRAINT "DatasetItem_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalRun" ADD CONSTRAINT "EvalRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalRun" ADD CONSTRAINT "EvalRun_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalRunModel" ADD CONSTRAINT "EvalRunModel_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvalRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalResult" ADD CONSTRAINT "EvalResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvalRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalResult" ADD CONSTRAINT "EvalResult_runModelId_fkey" FOREIGN KEY ("runModelId") REFERENCES "EvalRunModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalResult" ADD CONSTRAINT "EvalResult_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "DatasetItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
