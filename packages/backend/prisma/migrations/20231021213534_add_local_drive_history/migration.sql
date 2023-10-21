/*
  Warnings:

  - You are about to drop the `LogicalDrive` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LogicalDrive" DROP CONSTRAINT "LogicalDrive_clientId_fkey";

-- DropTable
DROP TABLE "LogicalDrive";

-- CreateTable
CREATE TABLE "LocalDrive" (
    "clientId" TEXT NOT NULL,
    "driveLetter" TEXT NOT NULL,
    "driveDescription" TEXT NOT NULL,
    "driveType" TEXT NOT NULL,
    "driveFileSystem" TEXT NOT NULL,
    "driveSize" BIGINT NOT NULL,
    "driveFreeSpace" BIGINT NOT NULL,

    CONSTRAINT "LocalDrive_pkey" PRIMARY KEY ("clientId","driveLetter")
);

-- CreateTable
CREATE TABLE "LocalDriveHistory" (
    "clientId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driveLetter" TEXT NOT NULL,
    "driveSize" BIGINT NOT NULL,
    "driveFreeSpace" BIGINT NOT NULL,

    CONSTRAINT "LocalDriveHistory_pkey" PRIMARY KEY ("clientId","driveLetter","timestamp")
);

-- AddForeignKey
ALTER TABLE "LocalDrive" ADD CONSTRAINT "LocalDrive_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalDriveHistory" ADD CONSTRAINT "LocalDriveHistory_clientId_driveLetter_fkey" FOREIGN KEY ("clientId", "driveLetter") REFERENCES "LocalDrive"("clientId", "driveLetter") ON DELETE RESTRICT ON UPDATE CASCADE;
