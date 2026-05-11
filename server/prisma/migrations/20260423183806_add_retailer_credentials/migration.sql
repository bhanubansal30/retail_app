/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Retailer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Retailer" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Retailer_userId_key" ON "Retailer"("userId");
