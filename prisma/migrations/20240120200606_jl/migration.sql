-- DropForeignKey
ALTER TABLE "ChatRoomOnUser" DROP CONSTRAINT "ChatRoomOnUser_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "ChatRoomOnUser" DROP CONSTRAINT "ChatRoomOnUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatRoomId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userEmail_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "subscriptions" TEXT[];

-- AddForeignKey
ALTER TABLE "ChatRoomOnUser" ADD CONSTRAINT "ChatRoomOnUser_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomOnUser" ADD CONSTRAINT "ChatRoomOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
