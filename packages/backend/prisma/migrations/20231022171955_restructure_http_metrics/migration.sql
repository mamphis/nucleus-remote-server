/*
  Warnings:

  - You are about to drop the `StatusCodeMetrics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "StatusCodeMetrics";

-- CreateTable
CREATE TABLE "StatusCode" (
    "id" INTEGER NOT NULL,
    "hitCount" INTEGER NOT NULL,
    "requestMetricsBucketId" TEXT,

    CONSTRAINT "StatusCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StatusCode" ADD CONSTRAINT "StatusCode_requestMetricsBucketId_fkey" FOREIGN KEY ("requestMetricsBucketId") REFERENCES "RequestMetrics"("bucketId") ON DELETE SET NULL ON UPDATE CASCADE;
