/*
  Warnings:

  - The primary key for the `StatusCode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StatusCode` table. All the data in the column will be lost.
  - Added the required column `statusCode` to the `StatusCode` table without a default value. This is not possible if the table is not empty.
  - Made the column `requestMetricsBucketId` on table `StatusCode` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "StatusCode" DROP CONSTRAINT "StatusCode_requestMetricsBucketId_fkey";

-- AlterTable
ALTER TABLE "StatusCode" DROP CONSTRAINT "StatusCode_pkey",
ADD COLUMN     "statusCode" INTEGER NOT NULL;

-- move data from column id to statusCode
UPDATE "StatusCode" SET "statusCode" = "id";

ALTER TABLE "StatusCode" DROP COLUMN "id",
ALTER COLUMN "requestMetricsBucketId" SET NOT NULL,
ADD CONSTRAINT "StatusCode_pkey" PRIMARY KEY ("requestMetricsBucketId", "statusCode");

-- AddForeignKey
ALTER TABLE "StatusCode" ADD CONSTRAINT "StatusCode_requestMetricsBucketId_fkey" FOREIGN KEY ("requestMetricsBucketId") REFERENCES "RequestMetrics"("bucketId") ON DELETE RESTRICT ON UPDATE CASCADE;
