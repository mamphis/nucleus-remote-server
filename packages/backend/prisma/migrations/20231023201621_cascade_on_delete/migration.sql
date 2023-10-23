-- DropForeignKey
ALTER TABLE "StatusCode" DROP CONSTRAINT "StatusCode_requestMetricsBucketId_fkey";

-- AddForeignKey
ALTER TABLE "StatusCode" ADD CONSTRAINT "StatusCode_requestMetricsBucketId_fkey" FOREIGN KEY ("requestMetricsBucketId") REFERENCES "RequestMetrics"("bucketId") ON DELETE CASCADE ON UPDATE CASCADE;
