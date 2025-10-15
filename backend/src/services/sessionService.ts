import { PrismaClient } from '@prisma/client';
import { SessionStatus, VehicleType, BillingType } from '@prisma/client';

const prisma = new PrismaClient();

interface SessionFilters {
  vehicleType?: VehicleType;
  page: number;
  limit: number;
}

interface SessionHistoryFilters {
  startDate?: Date;
  endDate?: Date;
  vehicleType?: VehicleType;
  status?: SessionStatus;
  page: number;
  limit: number;
}

class SessionService {
  async getActiveSessions(filters: SessionFilters) {
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

      const activeSessions = await Promise.all(sessions.map(async (session) => ({
        id: session.id,
        vehicle: {
          id: session.vehicle.id,
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          id: session.slot.id,
          slotNumber: session.slot.slotNumber,
          slotType: session.slot.slotType
        },
        entryTime: session.entryTime,
        duration: this.formatDuration(Date.now() - session.entryTime.getTime()),
        billingType: session.billingType,
        status: session.status,
        estimatedCost: await this.calculateCurrentCost(session)
      })));

      return {
        sessions: activeSessions,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting active sessions:', error);
      throw error;
    }
  }

  async getSessionById(sessionId: string) {
    try {
      const session = await prisma.parkingSession.findUnique({
        where: { id: sessionId },
        include: {
          vehicle: true,
          slot: true
        }
      });

      if (!session) return null;

      const duration = session.exitTime 
        ? session.exitTime.getTime() - session.entryTime.getTime()
        : Date.now() - session.entryTime.getTime();

      return {
        id: session.id,
        vehicle: {
          id: session.vehicle.id,
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          id: session.slot.id,
          slotNumber: session.slot.slotNumber,
          slotType: session.slot.slotType
        },
        entryTime: session.entryTime,
        exitTime: session.exitTime,
        duration: this.formatDuration(duration),
        billingType: session.billingType,
        billingAmount: session.billingAmount ? Number(session.billingAmount) : null,
        status: session.status,
        estimatedCost: session.status === SessionStatus.ACTIVE 
          ? await this.calculateCurrentCost(session)
          : session.billingAmount ? Number(session.billingAmount) : 0
      };
    } catch (error) {
      console.error('Error getting session by ID:', error);
      throw error;
    }
  }

  async getSessionByVehicle(numberPlate: string) {
    try {
      const session = await prisma.parkingSession.findFirst({
        where: {
          vehicle: { numberPlate },
          status: SessionStatus.ACTIVE
        },
        include: {
          vehicle: true,
          slot: true
        }
      });

      if (!session) return null;

      const duration = Date.now() - session.entryTime.getTime();

      return {
        id: session.id,
        vehicle: {
          id: session.vehicle.id,
          numberPlate: session.vehicle.numberPlate,
          vehicleType: session.vehicle.vehicleType
        },
        slot: {
          id: session.slot.id,
          slotNumber: session.slot.slotNumber,
          slotType: session.slot.slotType
        },
        entryTime: session.entryTime,
        duration: this.formatDuration(duration),
        billingType: session.billingType,
        status: session.status,
        estimatedCost: await this.calculateCurrentCost(session)
      };
    } catch (error) {
      console.error('Error getting session by vehicle:', error);
      throw error;
    }
  }

  async extendSession(sessionId: string, newBillingType: BillingType) {
    try {
      const session = await prisma.parkingSession.findUnique({
        where: { id: sessionId },
        include: { vehicle: true }
      });

      if (!session || session.status !== SessionStatus.ACTIVE) {
        return {
          success: false,
          message: 'Session not found or not active'
        };
      }

      // Update billing type
      const updatedSession = await prisma.parkingSession.update({
        where: { id: sessionId },
        data: { billingType: newBillingType }
      });

      return {
        success: true,
        message: `Session billing type updated to ${newBillingType}`,
        data: {
          sessionId: updatedSession.id,
          billingType: updatedSession.billingType,
          estimatedCost: await this.calculateCurrentCost(updatedSession)
        }
      };
    } catch (error) {
      console.error('Error extending session:', error);
      return {
        success: false,
        message: 'Failed to extend session'
      };
    }
  }

  async getSessionHistory(filters: SessionHistoryFilters) {
    try {
      const where: any = {};

      if (filters.status) {
        where.status = filters.status;
      }

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
          orderBy: { createdAt: 'desc' },
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingSession.count({ where })
      ]);

      const sessionHistory = sessions.map(session => {
        const duration = session.exitTime 
          ? session.exitTime.getTime() - session.entryTime.getTime()
          : Date.now() - session.entryTime.getTime();

        return {
          id: session.id,
          vehicle: {
            numberPlate: session.vehicle.numberPlate,
            vehicleType: session.vehicle.vehicleType
          },
          slot: {
            slotNumber: session.slot.slotNumber,
            slotType: session.slot.slotType
          },
          entryTime: session.entryTime,
          exitTime: session.exitTime,
          duration: this.formatDuration(duration),
          billingType: session.billingType,
          billingAmount: session.billingAmount ? Number(session.billingAmount) : null,
          status: session.status
        };
      });

      return {
        sessions: sessionHistory,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting session history:', error);
      throw error;
    }
  }

  async calculateSessionCost(sessionId: string) {
    try {
      const session = await prisma.parkingSession.findUnique({
        where: { id: sessionId },
        include: { vehicle: true }
      });

      if (!session) {
        return {
          success: false,
          message: 'Session not found'
        };
      }

      const cost = await this.calculateCurrentCost(session);
      const duration = session.exitTime 
        ? session.exitTime.getTime() - session.entryTime.getTime()
        : Date.now() - session.entryTime.getTime();

      return {
        success: true,
        data: {
          sessionId: session.id,
          currentCost: cost,
          duration: this.formatDuration(duration),
          billingType: session.billingType,
          status: session.status
        }
      };
    } catch (error) {
      console.error('Error calculating session cost:', error);
      return {
        success: false,
        message: 'Failed to calculate session cost'
      };
    }
  }

  async forceEndSession(sessionId: string) {
    try {
      const session = await prisma.parkingSession.findUnique({
        where: { id: sessionId },
        include: { vehicle: true, slot: true }
      });

      if (!session || session.status !== SessionStatus.ACTIVE) {
        return {
          success: false,
          message: 'Session not found or already ended'
        };
      }

      const exitTime = new Date();
      const billingAmount = await this.calculateCurrentCost(session);

      // End session and free slot
      await prisma.$transaction(async (tx) => {
        await tx.parkingSession.update({
          where: { id: sessionId },
          data: {
            exitTime,
            status: SessionStatus.COMPLETED,
            billingAmount
          }
        });

        await tx.parkingSlot.update({
          where: { id: session.slotId },
          data: { status: 'AVAILABLE' }
        });
      });

      return {
        success: true,
        message: 'Session ended successfully',
        data: {
          sessionId: session.id,
          exitTime,
          billingAmount,
          duration: this.formatDuration(exitTime.getTime() - session.entryTime.getTime())
        }
      };
    } catch (error) {
      console.error('Error force ending session:', error);
      return {
        success: false,
        message: 'Failed to end session'
      };
    }
  }

  async getSessionStats(period: 'day' | 'week' | 'month') {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      const [totalSessions, completedSessions, activeSessions, avgDurationData, revenueData] = await Promise.all([
        // Total sessions in period
        prisma.parkingSession.count({
          where: { entryTime: { gte: startDate } }
        }),

        // Completed sessions in period
        prisma.parkingSession.count({
          where: { 
            entryTime: { gte: startDate },
            status: SessionStatus.COMPLETED
          }
        }),

        // Currently active sessions
        prisma.parkingSession.count({
          where: { status: SessionStatus.ACTIVE }
        }),

        // Average duration data
        prisma.parkingSession.findMany({
          where: {
            entryTime: { gte: startDate },
            status: SessionStatus.COMPLETED,
            exitTime: { not: null }
          },
          select: {
            entryTime: true,
            exitTime: true
          }
        }),

        // Revenue data
        prisma.parkingSession.aggregate({
          where: {
            entryTime: { gte: startDate },
            status: SessionStatus.COMPLETED,
            billingAmount: { not: null }
          },
          _sum: { billingAmount: true }
        })
      ]);

      // Calculate average duration
      let avgDuration = '0h 0m';
      if (avgDurationData.length > 0) {
        const totalDuration = avgDurationData.reduce((sum, session) => {
          if (session.exitTime) {
            return sum + (session.exitTime.getTime() - session.entryTime.getTime());
          }
          return sum;
        }, 0);
        avgDuration = this.formatDuration(totalDuration / avgDurationData.length);
      }

      return {
        period,
        totalSessions,
        completedSessions,
        activeSessions,
        averageDuration: avgDuration,
        totalRevenue: Number(revenueData._sum.billingAmount) || 0,
        occupancyRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      throw error;
    }
  }

  async getOverstayAlerts(thresholdHours: number = 24) {
    try {
      const thresholdTime = new Date(Date.now() - thresholdHours * 60 * 60 * 1000);

      const overstayingSessions = await prisma.parkingSession.findMany({
        where: {
          status: SessionStatus.ACTIVE,
          entryTime: { lt: thresholdTime }
        },
        include: {
          vehicle: true,
          slot: true
        },
        orderBy: { entryTime: 'asc' }
      });

      const alerts = await Promise.all(overstayingSessions.map(async (session) => {
        const durationMs = Date.now() - session.entryTime.getTime();
        const hoursOverstay = Math.floor(durationMs / (1000 * 60 * 60)) - thresholdHours;

        return {
          sessionId: session.id,
          vehicle: {
            numberPlate: session.vehicle.numberPlate,
            vehicleType: session.vehicle.vehicleType
          },
          slot: {
            slotNumber: session.slot.slotNumber,
            slotType: session.slot.slotType
          },
          entryTime: session.entryTime,
          duration: this.formatDuration(durationMs),
          hoursOverstay,
          billingType: session.billingType,
          estimatedCost: await this.calculateCurrentCost(session),
          severity: hoursOverstay > 48 ? 'high' : hoursOverstay > 24 ? 'medium' : 'low'
        };
      }));

      return alerts;
    } catch (error) {
      console.error('Error getting overstay alerts:', error);
      throw error;
    }
  }

  private async calculateCurrentCost(session: any): Promise<number> {
    const now = session.exitTime || new Date();
    const durationMs = now.getTime() - session.entryTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    if (session.billingType === BillingType.DAY_PASS) {
      // Get day pass rate from pricing config
      const pricing = await prisma.pricingConfig.findFirst({
        where: {
          vehicleType: session.vehicle.vehicleType,
          billingType: BillingType.DAY_PASS,
          isActive: true
        }
      });
      return pricing ? Number(pricing.dayPassRate) : 100; // Default day pass rate
    } else {
      // Hourly billing
      const pricing = await prisma.pricingConfig.findFirst({
        where: {
          vehicleType: session.vehicle.vehicleType,
          billingType: BillingType.HOURLY,
          isActive: true
        }
      });
      const hourlyRate = pricing ? Number(pricing.hourlyRate) : 10; // Default hourly rate
      return hourlyRate * durationHours;
    }
  }

  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const sessionService = new SessionService();