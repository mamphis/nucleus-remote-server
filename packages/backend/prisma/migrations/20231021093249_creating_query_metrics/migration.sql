-- CreateTable
CREATE TABLE "QueryMetrics" (
    "bucketId" TEXT NOT NULL,
    "bucketTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "query" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL,
    "avgDuration" INTEGER NOT NULL,
    "maxDuration" INTEGER NOT NULL,

    CONSTRAINT "QueryMetrics_pkey" PRIMARY KEY ("bucketId")
);
