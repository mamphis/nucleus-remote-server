-- DropForeignKey
ALTER TABLE "FeatureFlag" DROP CONSTRAINT "FeatureFlag_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "InstalledApps" DROP CONSTRAINT "InstalledApps_clientId_fkey";

-- DropForeignKey
ALTER TABLE "LocalDrive" DROP CONSTRAINT "LocalDrive_clientId_fkey";

-- DropForeignKey
ALTER TABLE "LocalDriveHistory" DROP CONSTRAINT "LocalDriveHistory_clientId_driveLetter_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_tenantId_fkey";

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeatureFlag" ADD CONSTRAINT "FeatureFlag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstalledApps" ADD CONSTRAINT "InstalledApps_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalDrive" ADD CONSTRAINT "LocalDrive_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalDriveHistory" ADD CONSTRAINT "LocalDriveHistory_clientId_driveLetter_fkey" FOREIGN KEY ("clientId", "driveLetter") REFERENCES "LocalDrive"("clientId", "driveLetter") ON DELETE CASCADE ON UPDATE CASCADE;
