-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'ALMOST_FULL', 'FULL', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteLink" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategory" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "matchedCategory" TEXT,
    "matchedLocation" TEXT,
    "resultsFound" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "WhatsAppGroup_categoryId_idx" ON "WhatsAppGroup"("categoryId");

-- CreateIndex
CREATE INDEX "WhatsAppGroup_status_idx" ON "WhatsAppGroup"("status");

-- CreateIndex
CREATE INDEX "WhatsAppGroup_location_idx" ON "WhatsAppGroup"("location");

-- CreateIndex
CREATE INDEX "WhatsAppGroup_isFeatured_idx" ON "WhatsAppGroup"("isFeatured");

-- CreateIndex
CREATE INDEX "SearchLog_createdAt_idx" ON "SearchLog"("createdAt");

-- CreateIndex
CREATE INDEX "SearchLog_resultsFound_idx" ON "SearchLog"("resultsFound");

-- CreateIndex
CREATE INDEX "SearchLog_matchedCategory_idx" ON "SearchLog"("matchedCategory");

-- CreateIndex
CREATE INDEX "SearchLog_matchedLocation_idx" ON "SearchLog"("matchedLocation");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppGroup" ADD CONSTRAINT "WhatsAppGroup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
