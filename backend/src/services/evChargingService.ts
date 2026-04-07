import { PrismaClient } from '@prisma/client';
import { EVChargingStatus, EVQueueStatus, SessionStatus, SlotStatus, SlotType, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

interface QueueEntry {
  id: string;
  vehicleId: string;
  vehicleNumberPlate: string;
  vehicleType: VehicleType;
  requestedAt: Date;
  status: EVQueueStatus;
  position: number;
  estimatedWaitMinutes: number;
}

class EVChargingService {
  // Idle fee configuration (escalating)
  private readonly IDLE_FEE_FIRST_HOUR_PER_15MIN = 10;  // ₹10 per 15 min for first hour
  private readonly IDLE_FEE_AFTER_HOUR_PER_15MIN = 20;  // ₹20 per 15 min after first hour
  private readonly AVG_CHARGING_TIME_MINUTES = 45;       // Average EV charging time for wait estimation

  /**
   * Add a vehicle to the EV charging queue
   */
  async joinQueue(vehicleId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Verify vehicle exists and is an EV
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) {
        return { success: false, message: 'Vehicle not found' };
      }
      if (vehicle.vehicleType !== VehicleType.EV) {
        return { success: false, message: 'Only EV vehicles can join the charging queue' };
      }

      // Check if vehicle is already in queue
      const existingEntry = await prisma.eVChargingQueue.findFirst({
        where: {
          vehicleId,
          status: { in: [EVQueueStatus.WAITING, EVQueueStatus.NOTIFIED] }
        }
      });
      if (existingEntry) {
        return { success: false, message: 'Vehicle is already in the charging queue' };
      }

      // Check if vehicle already has an active EV session
      const activeSession = await prisma.parkingSession.findFirst({
        where: {
          vehicleId,
          status: SessionStatus.ACTIVE,
          slot: { slotType: SlotType.EV }
        }
      });
      if (activeSession) {
        return { success: false, message: 'Vehicle already has an active EV charging session' };
      }

      // Check if EV slots are actually full (otherwise no need to queue)
      const availableEVSlots = await prisma.parkingSlot.count({
        where: { slotType: SlotType.EV, status: SlotStatus.AVAILABLE }
      });
      if (availableEVSlots > 0) {
        return { success: false, message: 'EV charging slots are available — no need to queue. Please use vehicle entry to park directly.' };
      }

      // Add to queue
      const queueEntry = await prisma.eVChargingQueue.create({
        data: {
          vehicleId,
          status: EVQueueStatus.WAITING
        }
      });

      const position = await this.getPositionInQueue(queueEntry.id);

      return {
        success: true,
        message: 'Added to EV charging queue',
        data: {
          queueId: queueEntry.id,
          position,
          estimatedWaitMinutes: position * this.AVG_CHARGING_TIME_MINUTES
        }
      };
    } catch (error) {
      console.error('Error joining EV queue:', error);
      throw error;
    }
  }

  /**
   * Get the current queue with positions
   */
  async getQueue(): Promise<QueueEntry[]> {
    try {
      const entries = await prisma.eVChargingQueue.findMany({
        where: {
          status: { in: [EVQueueStatus.WAITING, EVQueueStatus.NOTIFIED] }
        },
        include: {
          vehicle: true
        },
        orderBy: [
          { priority: 'desc' },
          { requestedAt: 'asc' }
        ]
      });

      return entries.map((entry, index) => ({
        id: entry.id,
        vehicleId: entry.vehicleId,
        vehicleNumberPlate: entry.vehicle.numberPlate,
        vehicleType: entry.vehicle.vehicleType,
        requestedAt: entry.requestedAt,
        status: entry.status,
        position: index + 1,
        estimatedWaitMinutes: (index + 1) * this.AVG_CHARGING_TIME_MINUTES
      }));
    } catch (error) {
      console.error('Error getting EV queue:', error);
      throw error;
    }
  }

  /**
   * Get a specific vehicle's position in queue
   */
  async getQueuePosition(vehicleId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const queue = await this.getQueue();
      const entry = queue.find(e => e.vehicleId === vehicleId);

      if (!entry) {
        return { success: false, message: 'Vehicle is not in the charging queue' };
      }

      return {
        success: true,
        message: 'Queue position retrieved',
        data: {
          queueId: entry.id,
          position: entry.position,
          status: entry.status,
          estimatedWaitMinutes: entry.estimatedWaitMinutes,
          requestedAt: entry.requestedAt
        }
      };
    } catch (error) {
      console.error('Error getting queue position:', error);
      throw error;
    }
  }

  /**
   * Notify the next vehicle in queue when an EV slot becomes available
   */
  async notifyNextInQueue(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const availableEVSlots = await prisma.parkingSlot.count({
        where: { slotType: SlotType.EV, status: SlotStatus.AVAILABLE }
      });

      if (availableEVSlots === 0) {
        return {
          success: false,
          message: 'No EV charging slot is currently available to notify the next vehicle.'
        };
      }

      const nextEntry = await prisma.eVChargingQueue.findFirst({
        where: { status: EVQueueStatus.WAITING },
        include: { vehicle: true },
        orderBy: [
          { priority: 'desc' },
          { requestedAt: 'asc' }
        ]
      });

      if (!nextEntry) {
        return { success: false, message: 'No vehicles waiting in queue' };
      }

      await prisma.eVChargingQueue.update({
        where: { id: nextEntry.id },
        data: {
          status: EVQueueStatus.NOTIFIED,
          notifiedAt: new Date()
        }
      });

      return {
        success: true,
        message: `Vehicle ${nextEntry.vehicle.numberPlate} has been notified`,
        data: {
          queueId: nextEntry.id,
          vehicleNumberPlate: nextEntry.vehicle.numberPlate,
          vehicleId: nextEntry.vehicleId,
          notifiedAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error notifying next in queue:', error);
      throw error;
    }
  }

  /**
   * Mark an EV session's charging as complete
   */
  async markChargingComplete(sessionId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const session = await prisma.parkingSession.findFirst({
        where: {
          id: sessionId,
          status: SessionStatus.ACTIVE,
          slot: { slotType: SlotType.EV }
        },
        include: { vehicle: true, slot: true }
      });

      if (!session) {
        return { success: false, message: 'Active EV charging session not found' };
      }

      if (session.chargingStatus === EVChargingStatus.FULLY_CHARGED || session.chargingStatus === EVChargingStatus.IDLE) {
        return { success: false, message: 'Charging is already marked as complete' };
      }

      await prisma.parkingSession.update({
        where: { id: sessionId },
        data: {
          chargingStatus: EVChargingStatus.FULLY_CHARGED,
          chargeCompleteAt: new Date()
        }
      });

      return {
        success: true,
        message: `Charging complete for vehicle ${session.vehicle.numberPlate}. Idle fees will begin accruing.`,
        data: {
          sessionId: session.id,
          vehicleNumberPlate: session.vehicle.numberPlate,
          slotNumber: session.slot.slotNumber,
          chargeCompleteAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error marking charging complete:', error);
      throw error;
    }
  }

  /**
   * Calculate the current idle fee for a fully-charged EV
   */
  async calculateIdleFee(sessionId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const session = await prisma.parkingSession.findFirst({
        where: {
          id: sessionId,
          status: SessionStatus.ACTIVE,
          chargingStatus: { in: [EVChargingStatus.FULLY_CHARGED, EVChargingStatus.IDLE] }
        },
        include: { vehicle: true, slot: true }
      });

      if (!session) {
        return { success: false, message: 'No idle EV session found for this ID' };
      }

      if (!session.chargeCompleteAt) {
        return { success: false, message: 'Charging completion time not recorded' };
      }

      const idleFee = this.computeIdleFee(session.chargeCompleteAt);

      // Update session with current idle fee & mark as IDLE
      await prisma.parkingSession.update({
        where: { id: sessionId },
        data: {
          chargingStatus: EVChargingStatus.IDLE,
          idleFeeAmount: idleFee.totalFee
        }
      });

      return {
        success: true,
        message: 'Idle fee calculated',
        data: {
          sessionId: session.id,
          vehicleNumberPlate: session.vehicle.numberPlate,
          slotNumber: session.slot.slotNumber,
          chargeCompleteAt: session.chargeCompleteAt,
          idleMinutes: idleFee.idleMinutes,
          totalIdleFee: idleFee.totalFee,
          feeBreakdown: idleFee.breakdown,
          currency: '₹'
        }
      };
    } catch (error) {
      console.error('Error calculating idle fee:', error);
      throw error;
    }
  }

  /**
   * Get all currently idle EV sessions (useful for admin dashboard)
   */
  async getIdleSessions(): Promise<any[]> {
    try {
      const sessions = await prisma.parkingSession.findMany({
        where: {
          status: SessionStatus.ACTIVE,
          chargingStatus: { in: [EVChargingStatus.FULLY_CHARGED, EVChargingStatus.IDLE] }
        },
        include: { vehicle: true, slot: true }
      });

      return sessions.map(session => {
        const idleFee = session.chargeCompleteAt
          ? this.computeIdleFee(session.chargeCompleteAt)
          : { totalFee: 0, idleMinutes: 0, breakdown: '' };

        return {
          sessionId: session.id,
          vehicleNumberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType,
          slotNumber: session.slot.slotNumber,
          entryTime: session.entryTime,
          chargeCompleteAt: session.chargeCompleteAt,
          chargingStatus: session.chargingStatus,
          idleMinutes: idleFee.idleMinutes,
          currentIdleFee: idleFee.totalFee,
          currency: '₹'
        };
      });
    } catch (error) {
      console.error('Error getting idle sessions:', error);
      throw error;
    }
  }

  /**
   * Remove a vehicle from the queue (cancel)
   */
  async leaveQueue(vehicleId: string): Promise<{ success: boolean; message: string }> {
    try {
      const entry = await prisma.eVChargingQueue.findFirst({
        where: {
          vehicleId,
          status: { in: [EVQueueStatus.WAITING, EVQueueStatus.NOTIFIED] }
        }
      });

      if (!entry) {
        return { success: false, message: 'Vehicle is not in the queue' };
      }

      await prisma.eVChargingQueue.update({
        where: { id: entry.id },
        data: { status: EVQueueStatus.EXPIRED }
      });

      return { success: true, message: 'Removed from charging queue' };
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    }
  }

  // ─── Private Helpers ──────────────────────────────────────────

  private async getPositionInQueue(queueEntryId: string): Promise<number> {
    const queue = await prisma.eVChargingQueue.findMany({
      where: {
        status: { in: [EVQueueStatus.WAITING, EVQueueStatus.NOTIFIED] }
      },
      orderBy: [
        { priority: 'desc' },
        { requestedAt: 'asc' }
      ]
    });

    const index = queue.findIndex(e => e.id === queueEntryId);
    return index + 1;
  }

  private computeIdleFee(chargeCompleteAt: Date): {
    totalFee: number;
    idleMinutes: number;
    breakdown: string;
  } {
    const now = new Date();
    const idleMs = now.getTime() - chargeCompleteAt.getTime();
    const idleMinutes = Math.max(0, Math.floor(idleMs / (1000 * 60)));

    if (idleMinutes === 0) {
      return { totalFee: 0, idleMinutes: 0, breakdown: 'No idle time yet' };
    }

    const blocks = Math.ceil(idleMinutes / 15); // 15-minute blocks
    const firstHourBlocks = Math.min(blocks, 4); // max 4 blocks in first hour
    const afterHourBlocks = Math.max(0, blocks - 4);

    const firstHourFee = firstHourBlocks * this.IDLE_FEE_FIRST_HOUR_PER_15MIN;
    const afterHourFee = afterHourBlocks * this.IDLE_FEE_AFTER_HOUR_PER_15MIN;
    const totalFee = firstHourFee + afterHourFee;

    const breakdown = afterHourBlocks > 0
      ? `First hour: ${firstHourBlocks}×₹${this.IDLE_FEE_FIRST_HOUR_PER_15MIN} = ₹${firstHourFee} | After: ${afterHourBlocks}×₹${this.IDLE_FEE_AFTER_HOUR_PER_15MIN} = ₹${afterHourFee}`
      : `${firstHourBlocks}×₹${this.IDLE_FEE_FIRST_HOUR_PER_15MIN} = ₹${firstHourFee}`;

    return { totalFee, idleMinutes, breakdown };
  }
}

export const evChargingService = new EVChargingService();
