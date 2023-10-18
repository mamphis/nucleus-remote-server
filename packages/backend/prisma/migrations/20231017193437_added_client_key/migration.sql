/*
  Warnings:

  - Added the required column `keyId` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Key" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Key_pkey" PRIMARY KEY ("id")
);
-- Insert Default Key, so that we can add the foreign key
INSERT INTO "Key" ("id", "publicKey") VALUES ('default', '');

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "keyId" TEXT NOT NULL DEFAULT 'default';

-- remove default value
ALTER TABLE "Client" ALTER COLUMN "keyId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "Key"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
