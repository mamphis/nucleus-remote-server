/*
  Warnings:

  - The primary key for the `FeatureFlag` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "FeatureFlag" DROP CONSTRAINT "FeatureFlag_pkey",
ADD CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("tenantId", "id");
