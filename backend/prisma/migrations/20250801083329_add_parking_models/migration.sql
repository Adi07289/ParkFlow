/*
  Warnings:

  - Added the required column `name` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VehicleType" AS ENUM ('CAR', 'BIKE', 'EV', 'HANDICAP_ACCESSIBLE');

-- CreateEnum
CREATE TYPE "public"."SlotType" AS ENUM ('REGULAR', 'COMPACT', 'EV', 'HANDICAP_ACCESSIBLE');

-- CreateEnum
CREATE TYPE "public"."SlotStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."SessionStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."BillingType" AS ENUM ('HOURLY', 'DAY_PASS');

-- AlterTable
-- First add the name column with a default value
ALTER TABLE "public"."users" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'User';

-- Update existing user with their email as name
UPDATE "public"."users" SET "name" = SPLIT_PART("email", '@', 1) WHERE "name" = 'User';

-- Now remove the default constraint
ALTER TABLE "public"."users" ALTER COLUMN "name" DROP DEFAULT;

-- Add other columns
ALTER TABLE "public"."users" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'OPERATOR';

-- CreateTable
CREATE TABLE "public"."vehicles" (
    "id" TEXT NOT NULL,
    "numberPlate" TEXT NOT NULL,
    "vehicleType" "public"."VehicleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parking_slots" (
    "id" TEXT NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "slotType" "public"."SlotType" NOT NULL,
    "status" "public"."SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parking_sessions" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "status" "public"."SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "billingType" "public"."BillingType" NOT NULL,
    "billingAmount" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_config" (
    "id" TEXT NOT NULL,
    "vehicleType" "public"."VehicleType" NOT NULL,
    "billingType" "public"."BillingType" NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "dayPassRate" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pricing_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_numberPlate_key" ON "public"."vehicles"("numberPlate");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_slotNumber_key" ON "public"."parking_slots"("slotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_config_vehicleType_billingType_key" ON "public"."pricing_config"("vehicleType", "billingType");

-- AddForeignKey
ALTER TABLE "public"."parking_sessions" ADD CONSTRAINT "parking_sessions_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "public"."vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."parking_sessions" ADD CONSTRAINT "parking_sessions_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "public"."parking_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
