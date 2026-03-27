import { PrismaClient } from '@prisma/client';
import { SlotStatus, SessionStatus, SlotType } from '@prisma/client';

const prisma = new PrismaClient();

export interface SignageAreaAvailability {
  areaId: string;
  areaLabel: string;
  totalSlots: number;
  availableSlots: number;
  occupiedSlots: number;
  maintenanceSlots: number;
  status: 'FULL' | 'LOW' | 'AVAILABLE' | 'MAINTENANCE';
  displayMessage: string;
  availabilityByType: {
    slotType: string;
    available: number;
    total: number;
  }[];
}

export interface SignageFeedResponse {
  facilityName: string;
  timestamp: string;
  refreshIntervalMs: number;
  totalCapacity: number;
  totalAvailable: number;
  totalOccupied: number;
  overallStatus: 'FULL' | 'LOW' | 'AVAILABLE';
  areas: SignageAreaAvailability[];
}

export interface SignageDirectionalMessage {
  timestamp: string;
  primaryMessage: string;
  secondaryMessage: string;
  suggestedArea: string | null;
  spotsAvailable: number;
}

class SignageService {
  private readonly LOW_AVAILABILITY_THRESHOLD = 0.2; // 20% or fewer slots → LOW
  private readonly REFRESH_INTERVAL_MS = 15000; // 15 seconds recommended polling
  private readonly FACILITY_NAME = 'ParkFlow Parking Facility';

  /**
   * Get full availability feed for all digital signage displays
   */
  async getAvailabilityFeed(): Promise<SignageFeedResponse> {
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

      // Group slots by area (slot numbers like "A1-01", "B2-15" → area = prefix before '-')
      const areaMap = new Map<string, typeof slots>();
      
      slots.forEach(slot => {
        const area = slot.slotNumber.split('-')[0] || 'MAIN';
        if (!areaMap.has(area)) {
          areaMap.set(area, []);
        }
        areaMap.get(area)!.push(slot);
      });

      const areas: SignageAreaAvailability[] = Array.from(areaMap.entries()).map(([areaId, areaSlots]) => {
        const totalSlots = areaSlots.length;
        const availableSlots = areaSlots.filter(s => s.status === SlotStatus.AVAILABLE).length;
        const occupiedSlots = areaSlots.filter(s => s.status === SlotStatus.OCCUPIED).length;
        const maintenanceSlots = areaSlots.filter(s => s.status === SlotStatus.MAINTENANCE).length;

        // Determine area status
        let status: 'FULL' | 'LOW' | 'AVAILABLE' | 'MAINTENANCE';
        if (maintenanceSlots === totalSlots) {
          status = 'MAINTENANCE';
        } else if (availableSlots === 0) {
          status = 'FULL';
        } else if (availableSlots / totalSlots <= this.LOW_AVAILABILITY_THRESHOLD) {
          status = 'LOW';
        } else {
          status = 'AVAILABLE';
        }

        // Build display message
        const displayMessage = this.buildAreaDisplayMessage(areaId, availableSlots, totalSlots, status);

        // Availability by slot type within this area
        const slotTypeMap = new Map<string, { available: number; total: number }>();
        areaSlots.forEach(slot => {
          if (!slotTypeMap.has(slot.slotType)) {
            slotTypeMap.set(slot.slotType, { available: 0, total: 0 });
          }
          const typeData = slotTypeMap.get(slot.slotType)!;
          typeData.total++;
          if (slot.status === SlotStatus.AVAILABLE) {
            typeData.available++;
          }
        });

        return {
          areaId,
          areaLabel: `Level ${areaId}`,
          totalSlots,
          availableSlots,
          occupiedSlots,
          maintenanceSlots,
          status,
          displayMessage,
          availabilityByType: Array.from(slotTypeMap.entries()).map(([slotType, data]) => ({
            slotType,
            available: data.available,
            total: data.total
          }))
        };
      });

      // Overall facility stats
      const totalCapacity = slots.length;
      const totalAvailable = slots.filter(s => s.status === SlotStatus.AVAILABLE).length;
      const totalOccupied = slots.filter(s => s.status === SlotStatus.OCCUPIED).length;

      let overallStatus: 'FULL' | 'LOW' | 'AVAILABLE';
      if (totalAvailable === 0) {
        overallStatus = 'FULL';
      } else if (totalCapacity > 0 && totalAvailable / totalCapacity <= this.LOW_AVAILABILITY_THRESHOLD) {
        overallStatus = 'LOW';
      } else {
        overallStatus = 'AVAILABLE';
      }

      return {
        facilityName: this.FACILITY_NAME,
        timestamp: new Date().toISOString(),
        refreshIntervalMs: this.REFRESH_INTERVAL_MS,
        totalCapacity,
        totalAvailable,
        totalOccupied,
        overallStatus,
        areas
      };
    } catch (error) {
      console.error('Error getting signage availability feed:', error);
      throw error;
    }
  }

  /**
   * Get availability for a specific area/level
   */
  async getAreaAvailability(areaId: string): Promise<SignageAreaAvailability | null> {
    try {
      const feed = await this.getAvailabilityFeed();
      return feed.areas.find(a => a.areaId === areaId) || null;
    } catch (error) {
      console.error('Error getting area availability:', error);
      throw error;
    }
  }

  /**
   * Get directional message for entrance signage
   */
  async getDirectionalMessage(): Promise<SignageDirectionalMessage> {
    try {
      const feed = await this.getAvailabilityFeed();

      // Find the best area to direct traffic to
      const availableAreas = feed.areas
        .filter(a => a.status !== 'FULL' && a.status !== 'MAINTENANCE')
        .sort((a, b) => b.availableSlots - a.availableSlots);

      const bestArea = availableAreas[0] || null;

      let primaryMessage: string;
      let secondaryMessage: string;

      if (feed.overallStatus === 'FULL') {
        primaryMessage = '🔴 FACILITY FULL';
        secondaryMessage = 'No parking spots available at this time. Please try again later.';
      } else if (feed.overallStatus === 'LOW') {
        primaryMessage = `🟡 LIMITED SPOTS — ${feed.totalAvailable} Remaining`;
        secondaryMessage = bestArea
          ? `→ Head to ${bestArea.areaLabel} (${bestArea.availableSlots} spots)`
          : 'Please park in any available spot.';
      } else {
        primaryMessage = `🟢 WELCOME — ${feed.totalAvailable} Spots Available`;
        secondaryMessage = bestArea
          ? `→ ${bestArea.areaLabel} has the most availability (${bestArea.availableSlots} spots)`
          : 'Follow signs to available areas.';
      }

      return {
        timestamp: new Date().toISOString(),
        primaryMessage,
        secondaryMessage,
        suggestedArea: bestArea?.areaId || null,
        spotsAvailable: feed.totalAvailable
      };
    } catch (error) {
      console.error('Error getting directional message:', error);
      throw error;
    }
  }

  /**
   * Build human-readable display message for an area
   */
  private buildAreaDisplayMessage(
    areaId: string,
    availableSlots: number,
    totalSlots: number,
    status: string
  ): string {
    switch (status) {
      case 'FULL':
        return `Level ${areaId}: FULL`;
      case 'MAINTENANCE':
        return `Level ${areaId}: CLOSED FOR MAINTENANCE`;
      case 'LOW':
        return `Level ${areaId}: ${availableSlots} SPOT${availableSlots === 1 ? '' : 'S'} Left`;
      default:
        return `Level ${areaId}: ${availableSlots} SPOT${availableSlots === 1 ? '' : 'S'} Available`;
    }
  }
}

export const signageService = new SignageService();
