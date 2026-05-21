-- CreateEnum
CREATE TYPE "LodgeStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('NONE', 'TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Lodge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerName" TEXT,
    "whatsappNumber" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "location" TEXT NOT NULL,
    "address" TEXT,
    "googleMapsUrl" TEXT,
    "priceFrom" INTEGER NOT NULL,
    "lodgeType" TEXT NOT NULL,
    "roomTypes" TEXT,
    "facilities" TEXT[],
    "description" TEXT NOT NULL,
    "status" "LodgeStatus" NOT NULL DEFAULT 'PENDING',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'NONE',
    "subscriptionExpiresAt" TIMESTAMP(3),
    "notes" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "whatsappClicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lodge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LodgeImage" (
    "id" TEXT NOT NULL,
    "lodgeId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LodgeInquiry" (
    "id" TEXT NOT NULL,
    "lodgeId" TEXT NOT NULL,
    "name" TEXT,
    "whatsappNumber" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LodgeInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lodge_slug_key" ON "Lodge"("slug");

-- CreateIndex
CREATE INDEX "Lodge_status_idx" ON "Lodge"("status");

-- CreateIndex
CREATE INDEX "Lodge_location_idx" ON "Lodge"("location");

-- CreateIndex
CREATE INDEX "Lodge_lodgeType_idx" ON "Lodge"("lodgeType");

-- CreateIndex
CREATE INDEX "Lodge_isFeatured_idx" ON "Lodge"("isFeatured");

-- CreateIndex
CREATE INDEX "Lodge_subscriptionStatus_idx" ON "Lodge"("subscriptionStatus");

-- CreateIndex
CREATE INDEX "LodgeImage_lodgeId_idx" ON "LodgeImage"("lodgeId");

-- CreateIndex
CREATE INDEX "LodgeInquiry_lodgeId_idx" ON "LodgeInquiry"("lodgeId");

-- CreateIndex
CREATE INDEX "LodgeInquiry_createdAt_idx" ON "LodgeInquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "LodgeImage" ADD CONSTRAINT "LodgeImage_lodgeId_fkey" FOREIGN KEY ("lodgeId") REFERENCES "Lodge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LodgeInquiry" ADD CONSTRAINT "LodgeInquiry_lodgeId_fkey" FOREIGN KEY ("lodgeId") REFERENCES "Lodge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
