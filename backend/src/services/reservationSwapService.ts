import { PrismaClient } from '@prisma/client';
import { ReservationSwapStatus, SessionStatus, SlotStatus } from '@prisma/client';

const prisma = new PrismaClient();

class ReservationSwapService {
  private readonly DEFAULT_LISTING_EXPIRY_HOURS = 4; // Listings expire after 4 hours

  /**
   * List a reservation for swap
   */
  async listForSwap(
    userId: string,
    sessionId: string,
    listingPrice: number
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Verify the session exists and is active
      const session = await prisma.parkingSession.findFirst({
        where: {
          id: sessionId,
          status: SessionStatus.ACTIVE
        },
        include: { vehicle: true, slot: true }
      });

      if (!session) {
        return { success: false, message: 'Active session not found' };
      }

      // Check if already listed
      const existingListing = await prisma.reservationSwap.findFirst({
        where: {
          sessionId,
          status: ReservationSwapStatus.LISTED
        }
      });

      if (existingListing) {
        return { success: false, message: 'This reservation is already listed for swap' };
      }

      const originalPrice = session.billingAmount ? Number(session.billingAmount) : 0;
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.DEFAULT_LISTING_EXPIRY_HOURS);

      const swap = await prisma.reservationSwap.create({
        data: {
          originalUserId: userId,
          sessionId,
          slotId: session.slotId,
          originalPrice,
          listingPrice,
          status: ReservationSwapStatus.LISTED,
          expiresAt
        }
      });

      return {
        success: true,
        message: 'Reservation listed for swap',
        data: {
          swapId: swap.id,
          slotNumber: session.slot.slotNumber,
          vehicleNumberPlate: session.vehicle.numberPlate,
          originalPrice,
          listingPrice,
          expiresAt,
          currency: '₹'
        }
      };
    } catch (error) {
      console.error('Error listing for swap:', error);
      throw error;
    }
  }

  /**
   * Get all available swap listings
   */
  async getAvailableSwaps(): Promise<any[]> {
    try {
      // First expire old listings
      await this.expireOldListings();

      const swaps = await prisma.reservationSwap.findMany({
        where: { status: ReservationSwapStatus.LISTED },
        include: {
          session: {
            include: { vehicle: true, slot: true }
          },
          slot: true
        },
        orderBy: { listedAt: 'desc' }
      });

      return swaps.map(swap => ({
        id: swap.id,
        slotNumber: swap.slot.slotNumber,
        slotType: swap.slot.slotType,
        vehicleNumberPlate: swap.session.vehicle.numberPlate,
        originalPrice: Number(swap.originalPrice),
        listingPrice: Number(swap.listingPrice),
        listedAt: swap.listedAt,
        expiresAt: swap.expiresAt,
        savings: Number(swap.originalPrice) - Number(swap.listingPrice),
        currency: '₹'
      }));
    } catch (error) {
      console.error('Error getting available swaps:', error);
      throw error;
    }
  }

  /**
   * Claim a swap listing
   */
  async claimSwap(
    swapId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const swap = await prisma.reservationSwap.findFirst({
        where: {
          id: swapId,
          status: ReservationSwapStatus.LISTED
        },
        include: {
          session: { include: { slot: true } },
          slot: true
        }
      });

      if (!swap) {
        return { success: false, message: 'Swap listing not found or already claimed' };
      }

      if (swap.originalUserId === userId) {
        return { success: false, message: 'You cannot claim your own listing' };
      }

      if (new Date() > swap.expiresAt) {
        await prisma.reservationSwap.update({
          where: { id: swapId },
          data: { status: ReservationSwapStatus.EXPIRED }
        });
        return { success: false, message: 'This listing has expired' };
      }

      await prisma.reservationSwap.update({
        where: { id: swapId },
        data: {
          status: ReservationSwapStatus.CLAIMED,
          claimedByUserId: userId,
          claimedAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Swap claimed successfully',
        data: {
          swapId: swap.id,
          slotNumber: swap.slot.slotNumber,
          listingPrice: Number(swap.listingPrice),
          originalPrice: Number(swap.originalPrice),
          claimedAt: new Date(),
          currency: '₹'
        }
      };
    } catch (error) {
      console.error('Error claiming swap:', error);
      throw error;
    }
  }

  /**
   * Cancel a swap listing
   */
  async cancelListing(swapId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const swap = await prisma.reservationSwap.findFirst({
        where: {
          id: swapId,
          originalUserId: userId,
          status: ReservationSwapStatus.LISTED
        }
      });

      if (!swap) {
        return { success: false, message: 'Active listing not found or you are not the owner' };
      }

      await prisma.reservationSwap.update({
        where: { id: swapId },
        data: { status: ReservationSwapStatus.CANCELLED }
      });

      return { success: true, message: 'Listing cancelled' };
    } catch (error) {
      console.error('Error cancelling listing:', error);
      throw error;
    }
  }

  /**
   * Expire old listings automatically
   */
  private async expireOldListings(): Promise<number> {
    try {
      const result = await prisma.reservationSwap.updateMany({
        where: {
          status: ReservationSwapStatus.LISTED,
          expiresAt: { lt: new Date() }
        },
        data: { status: ReservationSwapStatus.EXPIRED }
      });
      return result.count;
    } catch (error) {
      console.error('Error expiring old listings:', error);
      return 0;
    }
  }

  /**
   * Get swap history for a user
   */
  async getUserSwapHistory(userId: string): Promise<any[]> {
    try {
      const swaps = await prisma.reservationSwap.findMany({
        where: {
          OR: [
            { originalUserId: userId },
            { claimedByUserId: userId }
          ]
        },
        include: {
          session: { include: { vehicle: true } },
          slot: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return swaps.map(swap => ({
        id: swap.id,
        slotNumber: swap.slot.slotNumber,
        vehicleNumberPlate: swap.session.vehicle.numberPlate,
        originalPrice: Number(swap.originalPrice),
        listingPrice: Number(swap.listingPrice),
        status: swap.status,
        role: swap.originalUserId === userId ? 'SELLER' : 'BUYER',
        listedAt: swap.listedAt,
        claimedAt: swap.claimedAt,
        currency: '₹'
      }));
    } catch (error) {
      console.error('Error getting swap history:', error);
      throw error;
    }
  }
}

export const reservationSwapService = new ReservationSwapService();
