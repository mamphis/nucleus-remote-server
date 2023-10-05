-- CreateTable
CREATE TABLE "InstalledApps" (
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "registryKey" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "installDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstalledApps_pkey" PRIMARY KEY ("clientId","name")
);

-- AddForeignKey
ALTER TABLE "InstalledApps" ADD CONSTRAINT "InstalledApps_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
