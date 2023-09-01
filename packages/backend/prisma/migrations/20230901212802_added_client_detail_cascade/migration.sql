-- DropForeignKey
ALTER TABLE "ClientDetail" DROP CONSTRAINT "ClientDetail_clientId_fkey";

-- AddForeignKey
ALTER TABLE "ClientDetail" ADD CONSTRAINT "ClientDetail_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
