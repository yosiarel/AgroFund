/*
  Warnings:

  - You are about to drop the column `trackingResi` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "trackingResi" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "category" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "trackingResi",
ADD COLUMN     "imageUrl" TEXT;
