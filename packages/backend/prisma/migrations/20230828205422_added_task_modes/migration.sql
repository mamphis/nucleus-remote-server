-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "runOnce" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "content" SET DEFAULT '';
