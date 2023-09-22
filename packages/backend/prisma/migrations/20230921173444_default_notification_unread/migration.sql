-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_approvedByUserId_fkey";

-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "unread" SET DEFAULT true,
ALTER COLUMN "approvedByUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_approvedByUserId_fkey" FOREIGN KEY ("approvedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
