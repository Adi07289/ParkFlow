import { PrismaClient } from '@prisma/client';
import { SlotType, VehicleType, SlotStatus, SessionStatus, BillingType } from '@prisma/client';

const prisma = new PrismaClient();

interface RevenueFilters {
  startDate?: Date;
  endDate?: Date;
}

class DashboardService {
  async getDashboardStats() {
    try {
      // Get slot statistics
      const [totalSlots, occupiedSlots, maintenanceSlots, slotsByType] = await Promise.all([
        prisma.parkingSlot.count(),
        prisma.parkingSlot.count({ where: { status: SlotStatus.OCCUPIED } }),
        prisma.parkingSlot.count({ where: { status: SlotStatus.MAINTENANCE } }),
        prisma.parkingSlot.groupBy({
          by: ['slotType', 'status'],
          _count: { id: true }
        })
      ]);

      const availableSlots = totalSlots - occupiedSlots - maintenanceSlots;
      const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

      // Process slots by type
      const slotTypeStats = Object.values(SlotType).map(type => {
        const typeSlots = slotsByType.filter(slot => slot.slotType === type);
        const total = typeSlots.reduce((sum, slot) => sum + slot._count.id, 0);
        const occupied = typeSlots.find(slot => slot.status === SlotStatus.OCCUPIED)?._count.id || 0;
        const maintenance = typeSlots.find(slot => slot.status === SlotStatus.MAINTENANCE)?._count.id || 0;
        const available = total - occupied - maintenance;

        return {
          type,
          total,
          occupied,
          available,
          maintenance
        };
      });

      // Get vehicles by type (currently parked)
      const activeSessionsWithVehicles = await prisma.parkingSession.findMany({
        where: { status: SessionStatus.ACTIVE },
        include: {
          vehicle: {
            select: { vehicleType: true }
          }
        }
      });

      const vehicleTypeStats = Object.values(VehicleType).map(type => {
        const count = activeSessionsWithVehicles
          .filter(session => session.vehicle.vehicleType === type)
          .length;
        
        return {
          type,
          count,
          percentage: occupiedSlots > 0 ? (count / occupiedSlots) * 100 : 0
        };
      });

      return {
        totalSlots,
        occupiedSlots,
        availableSlots,
        maintenanceSlots,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        slotsByType: slotTypeStats,
        vehiclesByType: vehicleTypeStats
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getRevenueStats(filters: RevenueFilters = {}) {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [todayRevenue, weekRevenue, monthRevenue, billingTypeRevenue] = await Promise.all([
        // Today's revenue
        prisma.parkingSession.aggregate({
          where: {
            status: SessionStatus.COMPLETED,
            exitTime: { gte: todayStart },
            billingAmount: { not: null }
          },
          _sum: { billingAmount: true }
        }),

        // This week's revenue
        prisma.parkingSession.aggregate({
          where: {
            status: SessionStatus.COMPLETED,
            exitTime: { gte: weekStart },
            billingAmount: { not: null }
          },
          _sum: { billingAmount: true }
        }),

        // This month's revenue
        prisma.parkingSession.aggregate({
          where: {
            status: SessionStatus.COMPLETED,
            exitTime: { gte: monthStart },
            billingAmount: { not: null }
          },
          _sum: { billingAmount: true }
        }),

        // Revenue by billing type
        prisma.parkingSession.groupBy({
          by: ['billingType'],
          where: {
            status: SessionStatus.COMPLETED,
            exitTime: filters.startDate || filters.endDate ? {
              gte: filters.startDate,
              lte: filters.endDate
            } : { gte: monthStart },
            billingAmount: { not: null }
          },
          _sum: { billingAmount: true }
        })
      ]);

      const billingStats = {
        hourly: billingTypeRevenue.find(b => b.billingType === BillingType.HOURLY)?._sum.billingAmount || 0,
        dayPass: billingTypeRevenue.find(b => b.billingType === BillingType.DAY_PASS)?._sum.billingAmount || 0
      };

      return {
        today: Number(todayRevenue._sum.billingAmount) || 0,
        thisWeek: Number(weekRevenue._sum.billingAmount) || 0,
        thisMonth: Number(monthRevenue._sum.billingAmount) || 0,
        byBillingType: {
          hourly: Number(billingStats.hourly) || 0,
          dayPass: Number(billingStats.dayPass) || 0
        },
        currency: '₹'
      };
    } catch (error) {
      console.error('Error getting revenue stats:', error);
      throw error;
    }
  }

  async getActivityStats() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const [entriesLastHour, exitsLastHour, avgDuration, peakHoursData] = await Promise.all([
        // Entries in last hour
        prisma.parkingSession.count({
          where: {
            entryTime: { gte: oneHourAgo }
          }
        }),

        // Exits in last hour
        prisma.parkingSession.count({
          where: {
            exitTime: { gte: oneHourAgo }
          }
        }),

        // Average parking duration (completed sessions from last 7 days)
        prisma.parkingSession.findMany({
          where: {
            status: SessionStatus.COMPLETED,
            exitTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          },
          select: {
            entryTime: true,
            exitTime: true
          }
        }),

        // Peak hours data (entries by hour for today)
        prisma.parkingSession.findMany({
          where: {
            entryTime: { 
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          select: {
            entryTime: true
          }
        })
      ]);

      // Calculate average duration
      let avgDurationMs = 0;
      if (avgDuration.length > 0) {
        const totalDuration = avgDuration.reduce((sum, session) => {
          if (session.exitTime) {
            return sum + (session.exitTime.getTime() - session.entryTime.getTime());
          }
          return sum;
        }, 0);
        avgDurationMs = totalDuration / avgDuration.length;
      }

      // Calculate peak hours
      const hourlyEntries = new Array(24).fill(0);
      peakHoursData.forEach(session => {
        const hour = session.entryTime.getHours();
        hourlyEntries[hour]++;
      });

      const peakHours = hourlyEntries
        .map((entries, hour) => ({ hour, entries }))
        .sort((a, b) => b.entries - a.entries)
        .slice(0, 5); // Top 5 peak hours

      return {
        entriesLastHour,
        exitsLastHour,
        averageParkingDuration: this.formatDuration(avgDurationMs),
        peakHours
      };
    } catch (error) {
      console.error('Error getting activity stats:', error);
      throw error;
    }
  }

  async getOccupancyTrends(period: 'day' | 'week' | 'month') {
    try {
      let groupBy: any;
      let startDate: Date;

      const now = new Date();
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          groupBy = { hour: true };
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          groupBy = { day: true };
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          groupBy = { day: true };
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          groupBy = { hour: true };
      }

      // Get sessions that were active during the period
      const sessions = await prisma.parkingSession.findMany({
        where: {
          OR: [
            { entryTime: { gte: startDate } },
            { 
              entryTime: { lt: startDate },
              OR: [
                { exitTime: { gte: startDate } },
                { exitTime: null }
              ]
            }
          ]
        },
        select: {
          entryTime: true,
          exitTime: true
        }
      });

      // Process trends based on period
      const trends = [];
      if (period === 'day') {
        for (let hour = 0; hour < 24; hour++) {
          const hourStart = new Date(startDate.getTime() + hour * 60 * 60 * 1000);
          const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
          
          const occupancy = sessions.filter(session => {
            const entryTime = session.entryTime;
            const exitTime = session.exitTime || now;
            return entryTime < hourEnd && exitTime > hourStart;
          }).length;

          trends.push({
            period: `${hour.toString().padStart(2, '0')}:00`,
            occupancy,
            timestamp: hourStart
          });
        }
      } else {
        // For week/month, group by days
        const days = period === 'week' ? 7 : 30;
        for (let day = 0; day < days; day++) {
          const dayStart = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          
          const occupancy = sessions.filter(session => {
            const entryTime = session.entryTime;
            const exitTime = session.exitTime || now;
            return entryTime < dayEnd && exitTime > dayStart;
          }).length;

          trends.push({
            period: dayStart.toISOString().split('T')[0],
            occupancy,
            timestamp: dayStart
          });
        }
      }

      return trends;
    } catch (error) {
      console.error('Error getting occupancy trends:', error);
      throw error;
    }
  }

  async getRealtimeUpdates() {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

      const [recentEntries, recentExits, alerts] = await Promise.all([
        // Recent entries
        prisma.parkingSession.findMany({
          where: {
            entryTime: { gte: fifteenMinutesAgo }
          },
          include: {
            vehicle: true,
            slot: true
          },
          orderBy: { entryTime: 'desc' },
          take: 10
        }),

        // Recent exits
        prisma.parkingSession.findMany({
          where: {
            exitTime: { gte: fifteenMinutesAgo }
          },
          include: {
            vehicle: true,
            slot: true
          },
          orderBy: { exitTime: 'desc' },
          take: 10
        }),

        // Maintenance alerts
        prisma.parkingSlot.findMany({
          where: {
            status: SlotStatus.MAINTENANCE
          },
          select: {
            id: true,
            slotNumber: true,
            updatedAt: true
          }
        })
      ]);

      const processedEntries = recentEntries.map(entry => ({
        type: 'entry',
        vehicleNumberPlate: entry.vehicle.numberPlate,
        slotNumber: entry.slot.slotNumber,
        timestamp: entry.entryTime
      }));

      const processedExits = recentExits.map(exit => ({
        type: 'exit',
        vehicleNumberPlate: exit.vehicle.numberPlate,
        slotNumber: exit.slot.slotNumber,
        timestamp: exit.exitTime
      }));

      const maintenanceAlerts = alerts.map(slot => ({
        type: 'maintenance',
        message: `Slot ${slot.slotNumber} is under maintenance`,
        timestamp: slot.updatedAt
      }));

      return {
        lastUpdate: new Date(),
        recentEntries: processedEntries,
        recentExits: processedExits,
        alerts: maintenanceAlerts
      };
    } catch (error) {
      console.error('Error getting realtime updates:', error);
      throw error;
    }
  }

  async getSlotAvailability(slotType?: SlotType) {
    try {
      const where: any = {};
      if (slotType) {
        where.slotType = slotType;
      }

      const slots = await prisma.parkingSlot.findMany({
        where,
        orderBy: { slotNumber: 'asc' }
      });

      const availability = {
        total: slots.length,
        available: slots.filter(slot => slot.status === SlotStatus.AVAILABLE).length,
        occupied: slots.filter(slot => slot.status === SlotStatus.OCCUPIED).length,
        maintenance: slots.filter(slot => slot.status === SlotStatus.MAINTENANCE).length,
        slots: slots.map(slot => ({
          id: slot.id,
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
          status: slot.status
        }))
      };

      return availability;
    } catch (error) {
      console.error('Error getting slot availability:', error);
      throw error;
    }
  }

  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const dashboardService = new DashboardService();