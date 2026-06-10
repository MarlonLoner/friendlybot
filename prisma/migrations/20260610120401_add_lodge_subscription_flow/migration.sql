-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ECOCASH', 'INNBUCKS', 'BANK_TRANSFER', 'WESTERN_UNION', 'WORLD_REMIT', 'MUKURU', 'OTHER');

-- CreateEnum
CREATE TYPE "ProofOfPaymentStatus" AS ENUM ('NOT_RECEIVED', 'RECEIVED', 'VERIFIED', 'REJECTED');

-- AlterEnum
ALTER TYPE "SubscriptionStatus" ADD VALUE 'PENDING_PAYMENT';

-- AlterTable
ALTER TABLE "Lodge" ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "paymentVerifiedBy" TEXT,
ADD COLUMN     "proofOfPaymentStatus" "ProofOfPaymentStatus" NOT NULL DEFAULT 'NOT_RECEIVED',
ADD COLUMN     "subscriptionAmount" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "subscriptionCurrency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN     "subscriptionPlan" TEXT NOT NULL DEFAULT 'ANNUAL_10';

-- CreateIndex
CREATE INDEX "Lodge_proofOfPaymentStatus_idx" ON "Lodge"("proofOfPaymentStatus");

-- CreateIndex
CREATE INDEX "Lodge_subscriptionExpiresAt_idx" ON "Lodge"("subscriptionExpiresAt");
