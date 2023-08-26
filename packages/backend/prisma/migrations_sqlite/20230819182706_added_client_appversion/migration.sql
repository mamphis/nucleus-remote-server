/*
  Warnings:

  - You are about to drop the column `osVersion` on the `Client` table. All the data in the column will be lost.
  - Added the required column `appVersion` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    CONSTRAINT "Client_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("hostname", "id", "os", "tenantId", "username") SELECT "hostname", "id", "os", "tenantId", "username" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
