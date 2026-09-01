-- AlterTable
ALTER TABLE "public"."parking_sessions" ADD COLUMN     "createdByUserId" TEXT;

-- CreateIndex
CREATE INDEX "parking_sessions_createdByUserId_idx" ON "public"."parking_sessions"("createdByUserId");

-- AddForeignKey
ALTER TABLE "public"."parking_sessions" ADD CONSTRAINT "parking_sessions_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
