-- CreateTable
CREATE TABLE "ClientDetail" (
    "key" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "ClientDetail_pkey" PRIMARY KEY ("key","clientId")
);

-- AddForeignKey
ALTER TABLE "ClientDetail" ADD CONSTRAINT "ClientDetail_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
