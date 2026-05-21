-- CreateEnum
CREATE TYPE "GroupRequestStatus" AS ENUM ('NEW', 'REVIEWED', 'CREATED', 'IGNORED');

-- CreateTable
CREATE TABLE "GroupRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "whatsappNumber" TEXT,
    "query" TEXT NOT NULL,
    "category" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "status" "GroupRequestStatus" NOT NULL DEFAULT 'NEW',
    "createdGroupId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupRequest_status_idx" ON "GroupRequest"("status");

-- CreateIndex
CREATE INDEX "GroupRequest_createdAt_idx" ON "GroupRequest"("createdAt");

-- CreateIndex
CREATE INDEX "GroupRequest_category_idx" ON "GroupRequest"("category");

-- CreateIndex
CREATE INDEX "GroupRequest_location_idx" ON "GroupRequest"("location");

-- CreateIndex
CREATE INDEX "GroupRequest_createdGroupId_idx" ON "GroupRequest"("createdGroupId");

-- AddForeignKey
ALTER TABLE "GroupRequest" ADD CONSTRAINT "GroupRequest_createdGroupId_fkey" FOREIGN KEY ("createdGroupId") REFERENCES "WhatsAppGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
