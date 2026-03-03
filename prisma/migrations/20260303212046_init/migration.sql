-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('DEPOSIT', 'DEBIT', 'FORCE_DEBIT');

-- CreateEnum
CREATE TYPE "MovementStatus" AS ENUM ('CREATED', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Movement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "status" "MovementStatus" NOT NULL DEFAULT 'CREATED',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletBalance" (
    "walletId" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletBalance_pkey" PRIMARY KEY ("walletId")
);

-- CreateTable
CREATE TABLE "CompanyBalance" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "eventId" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateIndex
CREATE INDEX "Movement_walletId_idx" ON "Movement"("walletId");

-- CreateIndex
CREATE INDEX "Movement_userId_idx" ON "Movement"("userId");

-- CreateIndex
CREATE INDEX "WebhookEvent_movementId_idx" ON "WebhookEvent"("movementId");
