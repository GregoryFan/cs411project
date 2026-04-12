/*
  Warnings:

  - You are about to drop the column `quantity` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `reportId` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `subcategory` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the `ActivityReport` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `activityEntryId` to the `Activity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carbonImpact` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_reportId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "quantity",
DROP COLUMN "reportId",
DROP COLUMN "subcategory",
ADD COLUMN     "activityEntryId" INTEGER NOT NULL,
ADD COLUMN     "carbonImpact" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "consumptionValue" DOUBLE PRECISION,
ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "foodQuantity" DOUBLE PRECISION,
ADD COLUMN     "foodType" TEXT,
ADD COLUMN     "transportMode" TEXT,
ADD COLUMN     "utilityType" TEXT;

-- DropTable
DROP TABLE "ActivityReport";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "totalCarbonBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityEntry" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalDayCO2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ActivityEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ActivityEntry" ADD CONSTRAINT "ActivityEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_activityEntryId_fkey" FOREIGN KEY ("activityEntryId") REFERENCES "ActivityEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
