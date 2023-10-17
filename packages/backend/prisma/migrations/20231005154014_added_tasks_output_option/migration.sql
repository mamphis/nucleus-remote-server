-- CreateEnum
CREATE TYPE "OutputOption" AS ENUM ('All', 'OnlyError', 'Special');

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "output" "OutputOption" NOT NULL DEFAULT 'All';
