-- AlterTable
ALTER TABLE "public"."parking_sessions"
ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE INDEX "parking_sessions_userId_idx" ON "public"."parking_sessions"("userId");

-- AddForeignKey
ALTER TABLE "public"."parking_sessions"
ADD CONSTRAINT "parking_sessions_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "public"."users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
