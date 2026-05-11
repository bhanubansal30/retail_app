-- CreateEnum
CREATE TYPE "ShopCategory" AS ENUM ('KIRANA', 'MERCHANT', 'CONFECTIONERY', 'OTHER');

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('WHOLESALER', 'RETAILER');

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "shopCategory" "ShopCategory" NOT NULL,
    "proprietorName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "businessType" "BusinessType" NOT NULL,
    "gstNumber" TEXT,
    "shopImageUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Retailer_mobileNumber_key" ON "Retailer"("mobileNumber");
