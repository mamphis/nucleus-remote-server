-- CreateTable
CREATE TABLE "LogicalDrive" (
    "clientId" TEXT NOT NULL,
    "driveLetter" TEXT NOT NULL,
    "driveDescription" TEXT NOT NULL,
    "driveType" TEXT NOT NULL,
    "driveFileSystem" TEXT NOT NULL,
    "driveSize" BIGINT NOT NULL,
    "driveFreeSpace" BIGINT NOT NULL,

    CONSTRAINT "LogicalDrive_pkey" PRIMARY KEY ("clientId","driveLetter")
);

-- AddForeignKey
ALTER TABLE "LogicalDrive" ADD CONSTRAINT "LogicalDrive_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
