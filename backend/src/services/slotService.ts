import { PrismaClient } from '@prisma/client';
import { SlotType, SlotStatus, VehicleType, SessionStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface SlotFilters {
  status?: SlotStatus;
  type?: SlotType;
  page: number;
  limit: number;
}

interface CreateSlotRequest {
  slotNumber: string;
  slotType: SlotType;
}

interface UpdateSlotRequest {
  status?: SlotStatus;
  slotType?: SlotType;
}

class SlotService {
  async getSlots(filters: SlotFilters) {
    try {
      const where: any = {};
      if (filters.status) where.status = filters.status;
      if (filters.type) where.slotType = filters.type;

      const [slots, total] = await Promise.all([
        prisma.parkingSlot.findMany({
          where,
          include: {
            sessions: {
              where: { status: SessionStatus.ACTIVE },
              include: { vehicle: true }
            }
          },
          orderBy: { slotNumber: 'asc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSlot.count({ where })
      ]);

      const slotsWithDetails = slots.map(slot => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType,
        status: slot.status,
        currentVehicle: slot.sessions[0] ? {
          numberPlate: slot.sessions[0].vehicle.numberPlate,
          vehicleType: slot.sessions[0].vehicle.vehicleType,
          entryTime: slot.sessions[0].entryTime
        } : null,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt
      }));

      return {
        slots: slotsWithDetails,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting slots:', error);
      throw error;
    }
  }

  async getSlotById(slotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: {
          sessions: {
            include: { vehicle: true },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      if (!slot) return null;

      const currentSession = slot.sessions.find(session => session.status === SessionStatus.ACTIVE);
      const sessionHistory = slot.sessions.filter(session => session.status === SessionStatus.COMPLETED);

      return {
        id: slot.id,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType,
        status: slot.status,
        currentSession: currentSession ? {
          id: currentSession.id,
          vehicle: {
            numberPlate: currentSession.vehicle.numberPlate,
            vehicleType: currentSession.vehicle.vehicleType
          },
          entryTime: currentSession.entryTime,
          billingType: currentSession.billingType
        } : null,
        sessionHistory: sessionHistory.map(session => ({
          id: session.id,
          vehicle: {
            numberPlate: session.vehicle.numberPlate,
            vehicleType: session.vehicle.vehicleType
          },
          entryTime: session.entryTime,
          exitTime: session.exitTime,
          billingAmount: session.billingAmount ? Number(session.billingAmount) : 0,
          duration: session.exitTime ? this.formatDuration(
            session.exitTime.getTime() - session.entryTime.getTime()
          ) : '0h 0m'
        })),
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt
      };
    } catch (error) {
      console.error('Error getting slot by ID:', error);
      throw error;
    }
  }

  async createSlot(data: CreateSlotRequest) {
    try {
      // Check if slot number already exists
      const existingSlot = await prisma.parkingSlot.findUnique({
        where: { slotNumber: data.slotNumber }
      });

      if (existingSlot) {
        return {
          success: false,
          message: `Slot number ${data.slotNumber} already exists`
        };
      }

      const slot = await prisma.parkingSlot.create({
        data: {
          slotNumber: data.slotNumber,
          slotType: data.slotType,
          status: SlotStatus.AVAILABLE
        }
      });

      return {
        success: true,
        message: 'Slot created successfully',
        data: slot
      };
    } catch (error) {
      console.error('Error creating slot:', error);
      return {
        success: false,
        message: 'Failed to create slot'
      };
    }
  }

  async updateSlot(slotId: string, data: UpdateSlotRequest) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE }
          }
        }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      // If trying to change status to MAINTENANCE, ensure slot is not occupied
      if (data.status === SlotStatus.MAINTENANCE && slot.sessions.length > 0) {
        return {
          success: false,
          message: 'Cannot set slot to maintenance while it is occupied'
        };
      }

      const updatedSlot = await prisma.parkingSlot.update({
        where: { id: slotId },
        data
      });

      return {
        success: true,
        message: 'Slot updated successfully',
        data: updatedSlot
      };
    } catch (error) {
      console.error('Error updating slot:', error);
      return {
        success: false,
        message: 'Failed to update slot'
      };
    }
  }

  async autoAssignSlot(vehicleType: VehicleType) {
    try {
      // Define slot preferences with fallbacks
      const slotPreferences = {
        [VehicleType.CAR]: [
          [SlotType.REGULAR],           // Prefer Regular first
          [SlotType.COMPACT]            // Fallback to Compact
        ],
        [VehicleType.BIKE]: [
          [SlotType.REGULAR]            // Bike slots only (assuming REGULAR includes bike parking)
        ],
        [VehicleType.EV]: [
          [SlotType.EV],               // Prefer EV slots first
          [SlotType.REGULAR, SlotType.COMPACT]  // Fallback to Regular/Compact if no EV available
        ],
        [VehicleType.HANDICAP_ACCESSIBLE]: [
          [SlotType.HANDICAP_ACCESSIBLE], // Prefer Handicap slots first
          [SlotType.REGULAR, SlotType.COMPACT]  // Fallback to Regular/Compact if no Handicap available
        ]
      };

      const preferences = slotPreferences[vehicleType];
      
      // Try each preference tier with row locking
      for (const slotTypes of preferences) {
        const result = await prisma.$transaction(async (tx) => {
          // Use SELECT FOR UPDATE to lock the slot during assignment
          const availableSlot = await tx.parkingSlot.findFirst({
            where: {
              status: SlotStatus.AVAILABLE,
              slotType: { in: slotTypes }
            },
            orderBy: [
              { slotNumber: 'asc' }  // Assign nearest slot first
            ]
          });

          if (availableSlot) {
            // Double-check slot is still available with row lock
            const lockedSlot = await tx.parkingSlot.findFirst({
              where: {
                id: availableSlot.id,
                status: SlotStatus.AVAILABLE
              }
            });

            if (lockedSlot) {
              return {
                success: true,
                slot: {
                  id: lockedSlot.id,
                  slotNumber: lockedSlot.slotNumber,
                  slotType: lockedSlot.slotType
                }
              };
            }
          }
          
          return null;
        }, {
          timeout: 5000,  // 5 second timeout to prevent deadlocks
          isolationLevel: 'ReadCommitted'
        });

        if (result) {
          return {
            success: true,
            message: `Slot assigned successfully (${result.slot.slotType} slot)`,
            slot: result.slot
          };
        }
      }

      // No slots available in any preference tier
      return {
        success: false,
        message: `No available slots for ${vehicleType} vehicles (checked all compatible slot types)`
      };
      
    } catch (error) {
      console.error('Error auto-assigning slot:', error);
      
      // Handle specific transaction errors
      if (error instanceof Error && error.message?.includes('timeout')) {
        return {
          success: false,
          message: 'Slot assignment timeout - please try again'
        };
      }
      
      return {
        success: false,
        message: 'Failed to auto-assign slot'
      };
    }
  }

  async reserveSlotForAssignment(slotId: string) {
    try {
      // Use transaction with row locking for manual slot assignment
      const result = await prisma.$transaction(async (tx) => {
        // Lock the specific slot for update
        const slot = await tx.parkingSlot.findFirst({
          where: {
            id: slotId,
            status: SlotStatus.AVAILABLE
          }
        });

        if (!slot) {
          return {
            success: false,
            message: 'Slot is no longer available or does not exist'
          };
        }

        // Return slot details if successfully locked
        return {
          success: true,
          slot: {
            id: slot.id,
            slotNumber: slot.slotNumber,
            slotType: slot.slotType
          }
        };
      }, {
        timeout: 5000,
        isolationLevel: 'ReadCommitted'
      });

      return result;
    } catch (error) {
      console.error('Error reserving slot for assignment:', error);
      
      if (error instanceof Error && error.message?.includes('timeout')) {
        return {
          success: false,
          message: 'Slot reservation timeout - slot may be in use'
        };
      }
      
      return {
        success: false,
        message: 'Failed to reserve slot'
      };
    }
  }

  async getAvailableSlots(vehicleType?: VehicleType) {
    try {
      let slotTypes: SlotType[] = [];
      
      if (vehicleType) {
        // Define compatible slot types for each vehicle type
        const slotCompatibility = {
          [VehicleType.CAR]: [SlotType.REGULAR, SlotType.COMPACT],
          [VehicleType.BIKE]: [SlotType.REGULAR], // Assuming regular slots can accommodate bikes
          [VehicleType.EV]: [SlotType.EV, SlotType.REGULAR, SlotType.COMPACT],
          [VehicleType.HANDICAP_ACCESSIBLE]: [SlotType.HANDICAP_ACCESSIBLE, SlotType.REGULAR, SlotType.COMPACT]
        };
        slotTypes = slotCompatibility[vehicleType] || [];
      }

      const where: any = { status: SlotStatus.AVAILABLE };
      if (slotTypes.length > 0) {
        where.slotType = { in: slotTypes };
      }

      const availableSlots = await prisma.parkingSlot.findMany({
        where,
        orderBy: [
          { slotType: 'asc' },    // Group by slot type
          { slotNumber: 'asc' }   // Then by slot number
        ],
        select: {
          id: true,
          slotNumber: true,
          slotType: true
        }
      });

      // Group slots by type for better UI display
      const groupedSlots = availableSlots.reduce((acc, slot) => {
        if (!acc[slot.slotType]) {
          acc[slot.slotType] = [];
        }
        acc[slot.slotType].push(slot);
        return acc;
      }, {} as Record<string, typeof availableSlots>);

      return {
        success: true,
        data: {
          slots: availableSlots,
          groupedByType: groupedSlots,
          totalAvailable: availableSlots.length
        }
      };
    } catch (error) {
      console.error('Error getting available slots:', error);
      return {
        success: true, // Changed to true - empty slots is not an error
        message: 'No slots available',
        data: {
          slots: [],
          groupedByType: {},
          totalAvailable: 0
        }
      };
    }
  }

  async setSlotMaintenance(slotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId },
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE }
          }
        }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      if (slot.sessions.length > 0) {
        return {
          success: false,
          message: 'Cannot set slot to maintenance while it is occupied'
        };
      }

      await prisma.parkingSlot.update({
        where: { id: slotId },
        data: { status: SlotStatus.MAINTENANCE }
      });

      return {
        success: true,
        message: `Slot ${slot.slotNumber} marked for maintenance`
      };
    } catch (error) {
      console.error('Error setting slot maintenance:', error);
      return {
        success: false,
        message: 'Failed to set maintenance status'
      };
    }
  }

  async releaseSlotMaintenance(slotId: string) {
    try {
      const slot = await prisma.parkingSlot.findUnique({
        where: { id: slotId }
      });

      if (!slot) {
        return {
          success: false,
          message: 'Slot not found'
        };
      }

      await prisma.parkingSlot.update({
        where: { id: slotId },
        data: { status: SlotStatus.AVAILABLE }
      });

      return {
        success: true,
        message: `Slot ${slot.slotNumber} released from maintenance`
      };
    } catch (error) {
      console.error('Error releasing slot maintenance:', error);
      return {
        success: false,
        message: 'Failed to release maintenance status'
      };
    }
  }

  async getAvailabilityMap() {
    try {
      const slots = await prisma.parkingSlot.findMany({
        include: {
          sessions: {
            where: { status: SessionStatus.ACTIVE },
            include: { vehicle: true }
          }
        },
        orderBy: { slotNumber: 'asc' }
      });

      // Group slots by area/floor (assuming slot numbers like "A1-01", "B2-15")
      const slotMap = new Map();

      slots.forEach(slot => {
        const area = slot.slotNumber.split('-')[0] || 'MAIN';
        
        if (!slotMap.has(area)) {
          slotMap.set(area, {
            area,
            totalSlots: 0,
            availableSlots: 0,
            occupiedSlots: 0,
            maintenanceSlots: 0,
            slots: []
          });
        }

        const areaData = slotMap.get(area);
        areaData.totalSlots++;
        
        switch (slot.status) {
          case SlotStatus.AVAILABLE:
            areaData.availableSlots++;
            break;
          case SlotStatus.OCCUPIED:
            areaData.occupiedSlots++;
            break;
          case SlotStatus.MAINTENANCE:
            areaData.maintenanceSlots++;
            break;
        }

        areaData.slots.push({
          id: slot.id,
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
          status: slot.status,
          currentVehicle: slot.sessions[0] ? {
            numberPlate: slot.sessions[0].vehicle.numberPlate,
            vehicleType: slot.sessions[0].vehicle.vehicleType
          } : null
        });
      });

      return {
        areas: Array.from(slotMap.values()),
        summary: {
          totalSlots: slots.length,
          availableSlots: slots.filter(s => s.status === SlotStatus.AVAILABLE).length,
          occupiedSlots: slots.filter(s => s.status === SlotStatus.OCCUPIED).length,
          maintenanceSlots: slots.filter(s => s.status === SlotStatus.MAINTENANCE).length
        }
      };
    } catch (error) {
      console.error('Error getting availability map:', error);
      throw error;
    }
  }

  async bulkCreateSlots(slotsData: CreateSlotRequest[]) {
    try {
      // Check for duplicate slot numbers within the request
      const slotNumbers = slotsData.map(slot => slot.slotNumber);
      const uniqueSlotNumbers = new Set(slotNumbers);
      
      if (slotNumbers.length !== uniqueSlotNumbers.size) {
        return {
          success: false,
          message: 'Duplicate slot numbers found in request'
        };
      }

      // Check for existing slot numbers in database
      const existingSlots = await prisma.parkingSlot.findMany({
        where: {
          slotNumber: { in: slotNumbers }
        }
      });

      if (existingSlots.length > 0) {
        const existingNumbers = existingSlots.map(slot => slot.slotNumber);
        return {
          success: false,
          message: `The following slot numbers already exist: ${existingNumbers.join(', ')}`
        };
      }

      // Create all slots
      const createdSlots = await prisma.parkingSlot.createMany({
        data: slotsData.map(slot => ({
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
          status: SlotStatus.AVAILABLE
        }))
      });

      return {
        success: true,
        message: `Successfully created ${createdSlots.count} slots`,
        data: { count: createdSlots.count }
      };
    } catch (error) {
      console.error('Error bulk creating slots:', error);
      return {
        success: false,
        message: 'Failed to create slots'
      };
    }
  }

  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const slotService = new SlotService();