import { PrismaClient } from '@prisma/client';
import { VehicleType, BillingType, SlotStatus, SessionStatus, SlotType } from '@prisma/client';
import { slotService } from './slotService';
import { billingService } from './billingService';

const prisma = new PrismaClient();

interface VehicleEntryRequest {
  numberPlate: string;
  vehicleType: VehicleType;
  billingType: BillingType;
  slotId?: string;
}

interface SearchFilters {
  vehicleType?: VehicleType;
  page: number;
  limit: number;
}

interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  vehicleType?: VehicleType;
  page: number;
  limit: number;
}

class ParkingService {
  async registerVehicleEntry(data: VehicleEntryRequest) {
    try {
      // Check if vehicle already has an active session
      const activeSession = await prisma.parkingSession.findFirst({
        where: {
          vehicle: { numberPlate: data.numberPlate },
          status: SessionStatus.ACTIVE
        },
        include: {
          vehicle: true,
          slot: true
        }
      });

      if (activeSession) {
        return {
          success: false,
          message: `Vehicle ${data.numberPlate} is already parked in slot ${activeSession.slot.slotNumber}`
        };
      }

      let slotAssignmentResult;

      if (data.slotId) {
        // Manual slot assignment with row locking
        slotAssignmentResult = await slotService.reserveSlotForAssignment(data.slotId);
        
        if (!slotAssignmentResult.success) {
          return {
            success: false,
            message: slotAssignmentResult.message || 'Failed to reserve selected slot'
          };
        }
      } else {
        // Auto slot assignment with fallback logic and row locking
        slotAssignmentResult = await slotService.autoAssignSlot(data.vehicleType);
        
        if (!slotAssignmentResult.success) {
          return {
            success: false,
            message: slotAssignmentResult.message || `No available slots for ${data.vehicleType} vehicles`
          };
        }
      }

      const assignedSlot = slotAssignmentResult.slot;
      if (!assignedSlot) {
        return {
          success: false,
          message: 'Failed to get slot assignment details'
        };
      }

      // Create or get vehicle
      let vehicle = await prisma.vehicle.findUnique({
        where: { numberPlate: data.numberPlate }
      });

      if (!vehicle) {
        vehicle = await prisma.vehicle.create({
          data: {
            numberPlate: data.numberPlate,
            vehicleType: data.vehicleType
          }
        });
      }

      // Create parking session and update slot status with enhanced transaction handling
      const session = await prisma.$transaction(async (tx) => {
        // Double-check slot is still available before final assignment
        const currentSlot = await tx.parkingSlot.findFirst({
          where: { 
            id: assignedSlot.id,
            status: SlotStatus.AVAILABLE 
          }
        });

        if (!currentSlot) {
          throw new Error('Slot is no longer available - please try again');
        }

        // Update slot status
        await tx.parkingSlot.update({
          where: { id: assignedSlot.id },
          data: { status: SlotStatus.OCCUPIED }
        });

        // Create session
        return await tx.parkingSession.create({
          data: {
            vehicleId: vehicle.id,
            slotId: assignedSlot.id,
            billingType: data.billingType,
            status: SessionStatus.ACTIVE
          },
          include: {
            vehicle: true,
            slot: true
          }
        });
      }, {
        timeout: 10000,
        isolationLevel: 'ReadCommitted'
      });

      return {
        success: true,
        message: 'Vehicle entry registered successfully',
        data: {
          sessionId: session.id,
          vehicleId: vehicle.id,
          slotId: assignedSlot.id,
          slotNumber: assignedSlot.slotNumber,
          entryTime: session.entryTime,
          billingType: session.billingType
        }
      };
    } catch (error) {
      console.error('Error registering vehicle entry:', error);
      throw error;
    }
  }

  async registerVehicleExit(numberPlate: string) {
    try {
      const activeSession = await prisma.parkingSession.findFirst({
        where: {
          vehicle: { numberPlate },
          status: SessionStatus.ACTIVE
        },
        include: {
          vehicle: true,
          slot: true
        }
      });

      if (!activeSession) {
        return {
          success: false,
          message: `No active parking session found for vehicle ${numberPlate}`
        };
      }

      const exitTime = new Date();
      
      // Calculate billing amount using the new billing service
      const billingResult = billingService.calculateBillingAmount(
        activeSession.entryTime,
        exitTime,
        activeSession.billingType
      );

      const { amount: billingAmount, duration: durationString } = billingResult;

      // Complete session and free slot
      await prisma.$transaction(async (tx) => {
        // Update session
        await tx.parkingSession.update({
          where: { id: activeSession.id },
          data: {
            exitTime,
            status: SessionStatus.COMPLETED,
            billingAmount
          }
        });

        // Free the slot
        await tx.parkingSlot.update({
          where: { id: activeSession.slotId },
          data: { status: SlotStatus.AVAILABLE }
        });
      });

      return {
        success: true,
        message: 'Vehicle exit registered successfully',
        data: {
          sessionId: activeSession.id,
          numberPlate: activeSession.vehicle.numberPlate,
          vehicleType: activeSession.vehicle.vehicleType,
          slotNumber: activeSession.slot.slotNumber,
          entryTime: activeSession.entryTime,
          exitTime,
          duration: durationString,
          billingAmount,
          billingType: activeSession.billingType,
          durationHours: billingResult.durationHours,
          appliedRate: billingResult.appliedRate,
          currency: billingService.getCurrency()
        }
      };
    } catch (error) {
      console.error('Error registering vehicle exit:', error);
      throw error;
    }
  }

  async searchVehicle(numberPlate: string) {
    try {
      const vehicle = await prisma.vehicle.findUnique({
        where: { numberPlate },
        include: {
          sessions: {
            include: {
              slot: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!vehicle) {
        return {
          success: false,
          message: `Vehicle ${numberPlate} not found`
        };
      }

      const currentSession = vehicle.sessions.find(session => session.status === SessionStatus.ACTIVE);
      
      const parkingHistory = vehicle.sessions
        .filter(session => session.status === SessionStatus.COMPLETED)
        .slice(0, 10) // Last 10 sessions
        .map(session => ({
          id: session.id,
          slotNumber: session.slot.slotNumber,
          entryTime: session.entryTime,
          exitTime: session.exitTime,
          billingAmount: session.billingAmount ? Number(session.billingAmount) : 0,
          duration: session.exitTime ? this.formatDuration(
            session.exitTime.getTime() - session.entryTime.getTime()
          ) : '0h 0m'
        }));

      return {
        success: true,
        data: {
          vehicle: {
            id: vehicle.id,
            numberPlate: vehicle.numberPlate,
            vehicleType: vehicle.vehicleType
          },
          currentSession: currentSession ? {
            id: currentSession.id,
            slotNumber: currentSession.slot.slotNumber,
            entryTime: currentSession.entryTime,
            billingType: currentSession.billingType,
            status: currentSession.status
          } : undefined,
          parkingHistory
        }
      };
    } catch (error) {
      console.error('Error searching vehicle:', error);
      throw error;
    }
  }

  async quickSearchVehicles(query: string) {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: {
          numberPlate: {
            contains: query,
            mode: 'insensitive'
          }
        },
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE },
            include: { slot: true }
          }
        },
        take: 10
      });

      return vehicles.map(vehicle => ({
        id: vehicle.id,
        numberPlate: vehicle.numberPlate,
        vehicleType: vehicle.vehicleType,
        isCurrentlyParked: vehicle.sessions.length > 0,
        currentSlot: vehicle.sessions[0]?.slot.slotNumber
      }));
    } catch (error) {
      console.error('Error in quick search:', error);
      throw error;
    }
  }

  async getCurrentlyParkedVehicles(filters: SearchFilters) {
    try {
      const where: any = {
        status: SessionStatus.ACTIVE
      };

      if (filters.vehicleType) {
        where.vehicle = { vehicleType: filters.vehicleType };
      }

      const [sessions, total] = await Promise.all([
        prisma.parkingSession.findMany({
          where,
          include: {
            vehicle: true,
            slot: true
          },
          orderBy: { entryTime: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSession.count({ where })
      ]);

      const data = sessions.map(session => ({
        sessionId: session.id,
        vehicle: {
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          number: session.slot.slotNumber,
          type: session.slot.slotType
        },
        entryTime: session.entryTime,
        duration: this.formatDuration(Date.now() - session.entryTime.getTime()),
        billingType: session.billingType
      }));

      return {
        success: true,
        data,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting currently parked vehicles:', error);
      throw error;
    }
  }

  async getParkingHistory(filters: HistoryFilters) {
    try {
      const where: any = {
        status: SessionStatus.COMPLETED
      };

      if (filters.startDate || filters.endDate) {
        where.entryTime = {};
        if (filters.startDate) where.entryTime.gte = filters.startDate;
        if (filters.endDate) where.entryTime.lte = filters.endDate;
      }

      if (filters.vehicleType) {
        where.vehicle = { vehicleType: filters.vehicleType };
      }

      const [sessions, total] = await Promise.all([
        prisma.parkingSession.findMany({
          where,
          include: {
            vehicle: true,
            slot: true
          },
          orderBy: { exitTime: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSession.count({ where })
      ]);

      const data = sessions.map(session => ({
        sessionId: session.id,
        vehicle: {
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          number: session.slot.slotNumber,
          type: session.slot.slotType
        },
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        duration: session.exitTime ? this.formatDuration(
          session.exitTime.getTime() - session.entryTime.getTime()
        ) : '0h 0m',
        billingAmount: session.billingAmount ? Number(session.billingAmount) : 0,
        billingType: session.billingType
      }));

      return {
        success: true,
        data,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting parking history:', error);
      throw error;
    }
  }


  async overrideSlot(sessionId: string, newSlotId: string) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1. Lock and validate the current session
        const currentSession = await tx.parkingSession.findFirst({
          where: {
            id: sessionId,
            status: SessionStatus.ACTIVE
          },
          include: {
            vehicle: true,
            slot: true
          }
        });

        if (!currentSession) {
          throw new Error('Active parking session not found');
        }

        // 2. Prevent override to the same slot
        if (currentSession.slotId === newSlotId) {
          throw new Error('Cannot override to the current slot');
        }

        // 3. Lock and validate the current slot
        const currentSlot = await tx.parkingSlot.findFirst({
          where: {
            id: currentSession.slotId,
            status: SlotStatus.OCCUPIED
          }
        });

        if (!currentSlot) {
          throw new Error('Current slot is in invalid state');
        }

        // 4. Lock and validate the new slot
        const newSlot = await tx.parkingSlot.findFirst({
          where: {
            id: newSlotId,
            status: SlotStatus.AVAILABLE
          }
        });

        if (!newSlot) {
          throw new Error('Target slot is not available or does not exist');
        }

        // 5. Validate vehicle-slot compatibility
        const vehicleType = currentSession.vehicle.vehicleType;
        const isCompatible = this.isSlotCompatibleWithVehicle(vehicleType, newSlot.slotType);
        
        if (!isCompatible) {
          throw new Error(`${vehicleType} vehicles are not compatible with ${newSlot.slotType} slots`);
        }

        // 6. Perform atomic slot override operations
        // Update session to point to new slot (preserve entryTime and all other data)
        const updatedSession = await tx.parkingSession.update({
          where: { id: sessionId },
          data: { slotId: newSlotId },
          include: {
            vehicle: true,
            slot: true
          }
        });

        // 7. Release old slot
        await tx.parkingSlot.update({
          where: { id: currentSession.slotId },
          data: { status: SlotStatus.AVAILABLE }
        });

        // 8. Occupy new slot
        await tx.parkingSlot.update({
          where: { id: newSlotId },
          data: { status: SlotStatus.OCCUPIED }
        });

        return {
          success: true,
          session: updatedSession,
          oldSlot: currentSlot,
          newSlot: newSlot
        };
      }, {
        timeout: 10000,
        isolationLevel: 'ReadCommitted'
      });

      return {
        success: true,
        message: `Slot override successful: ${result.oldSlot.slotNumber} → ${result.newSlot.slotNumber}`,
        data: {
          sessionId: result.session.id,
          vehicleNumberPlate: result.session.vehicle.numberPlate,
          oldSlot: {
            id: result.oldSlot.id,
            slotNumber: result.oldSlot.slotNumber,
            slotType: result.oldSlot.slotType
          },
          newSlot: {
            id: result.newSlot.id,
            slotNumber: result.newSlot.slotNumber,
            slotType: result.newSlot.slotType
          },
          entryTime: result.session.entryTime, // Preserved original entry time
          billingType: result.session.billingType
        }
      };
    } catch (error) {
      console.error('Error overriding slot:', error);
      
      // Handle specific transaction errors
      if (error instanceof Error) {
        if (error.message?.includes('timeout')) {
          return {
            success: false,
            message: 'Slot override timeout - please try again'
          };
        }
        
        // Return the specific error message for business logic errors
        return {
          success: false,
          message: error.message
        };
      }
      
      return {
        success: false,
        message: 'Failed to override slot - please try again'
      };
    }
  }

  private isSlotCompatibleWithVehicle(vehicleType: VehicleType, slotType: SlotType): boolean {
    // Define compatibility matrix based on business rules
    const compatibility: Record<VehicleType, SlotType[]> = {
      [VehicleType.CAR]: [SlotType.REGULAR, SlotType.COMPACT],
      [VehicleType.BIKE]: [SlotType.REGULAR], // Assuming regular slots accommodate bikes
      [VehicleType.EV]: [SlotType.EV, SlotType.REGULAR, SlotType.COMPACT], // EV can use any slot
      [VehicleType.HANDICAP_ACCESSIBLE]: [SlotType.HANDICAP_ACCESSIBLE, SlotType.REGULAR, SlotType.COMPACT]
    };

    const compatibleSlotTypes = compatibility[vehicleType] || [];
    return compatibleSlotTypes.includes(slotType);
  }

  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const parkingService = new ParkingService();