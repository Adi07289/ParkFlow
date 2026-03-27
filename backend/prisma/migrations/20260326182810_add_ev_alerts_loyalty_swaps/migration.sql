-- CreateEnum
CREATE TYPE "public"."EVChargingStatus" AS ENUM ('CHARGING', 'FULLY_CHARGED', 'IDLE');

-- CreateEnum
CREATE TYPE "public"."EVQueueStatus" AS ENUM ('WAITING', 'NOTIFIED', 'EXPIRED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('OVERSTAY', 'UNAUTHORIZED_AREA', 'RAPID_ENTRY', 'REPEATED_OFFENDER', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."AlertSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."SubscriptionTier" AS ENUM ('BASIC', 'PREMIUM', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ReservationSwapStatus" AS ENUM ('LISTED', 'CLAIMED', 'EXPIRED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."parking_sessions" ADD COLUMN     "chargeCompleteAt" TIMESTAMP(3),
ADD COLUMN     "chargingStatus" "public"."EVChargingStatus",
ADD COLUMN     "idleFeeAmount" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "public"."ev_charging_queue" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),
    "status" "public"."EVQueueStatus" NOT NULL DEFAULT 'WAITING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ev_charging_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parking_alerts" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "vehicleId" TEXT,
    "alertType" "public"."AlertType" NOT NULL,
    "severity" "public"."AlertSeverity" NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" "public"."SubscriptionTier" NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reservation_swaps" (
    "id" TEXT NOT NULL,
    "originalUserId" TEXT NOT NULL,
    "claimedByUserId" TEXT,
    "sessionId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "originalPrice" DECIMAL(10,2) NOT NULL,
    "listingPrice" DECIMAL(10,2) NOT NULL,
    "status" "public"."ReservationSwapStatus" NOT NULL DEFAULT 'LISTED',
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_swaps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."ev_charging_queue" ADD CONSTRAINT "ev_charging_queue_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parking_alerts" ADD CONSTRAINT "parking_alerts_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."parking_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parking_alerts" ADD CONSTRAINT "parking_alerts_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation_swaps" ADD CONSTRAINT "reservation_swaps_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."parking_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation_swaps" ADD CONSTRAINT "reservation_swaps_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."parking_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
