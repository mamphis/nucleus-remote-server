-- CreateTable
CREATE TABLE "RequestMetrics" (
    "bucketId" TEXT NOT NULL,
    "bucketTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestPath" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL,
    "avgDuration" INTEGER NOT NULL,
    "maxDuration" INTEGER NOT NULL,

    CONSTRAINT "RequestMetrics_pkey" PRIMARY KEY ("bucketId")
);

-- CreateTable
CREATE TABLE "StatusCodeMetrics" (
    "bucketId" TEXT NOT NULL,
    "bucketTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statusCode" INTEGER NOT NULL,
    "hitCount" INTEGER NOT NULL,
    "avgDuration" INTEGER NOT NULL,
    "maxDuration" INTEGER NOT NULL,

    CONSTRAINT "StatusCodeMetrics_pkey" PRIMARY KEY ("bucketId")
);
