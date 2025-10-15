import { PrismaClient } from '@prisma/client';
import { SessionStatus, BillingType, VehicleType, SlotType } from '@prisma/client';

const prisma = new PrismaClient();

export interface RevenueAnalytics {
  period: string;
  totalRevenue: number;
  hourlyRevenue: number;
  dayPassRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  growthRate: number;
}

export interface SlotUtilizationAnalytics {
  slotType: SlotType;
  totalSlots: number;
  averageOccupancy: number;
  peakOccupancy: number;
  totalRevenue: number;
  utilizationRate: number;
  revenuePerSlot: number;
}

export interface PeakHourAnalytics {
  hour: number;
  entries: number;
  exits: number;
  revenue: number;
  occupancyRate: number;
  averageStayDuration: number;
}

export interface VehicleTypeAnalytics {
  vehicleType: VehicleType;
  count: number;
  percentage: number;
  averageDuration: number;
  totalRevenue: number;
  revenuePerVehicle: number;
}

export interface OperationalMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageStayDuration: number;
  turnoverRate: number;
  peakCapacityUtilization: number;
  overstayRate: number;
}

class AnalyticsService {
  /**
   * Get comprehensive revenue analytics
   */
  async getRevenueAnalytics(
    period: 'day' | 'week' | 'month' = 'day', 
    startDate?: Date, 
    endDate?: Date
  ): Promise<RevenueAnalytics[]> {
    try {
      const { start, end, groupBy } = this.getPeriodRange(period, startDate, endDate);

      const sessions = await prisma.parkingSession.findMany({
        where: {
          status: SessionStatus.COMPLETED,
          exitTime: {
            gte: start,
            lte: end
          },
          billingAmount: { not: null }
        },
        select: {
          exitTime: true,
          billingAmount: true,
          billingType: true,
          entryTime: true
        }
      });

      // Group sessions by period
      const groupedData = new Map<string, {
        totalRevenue: number;
        hourlyRevenue: number;
        dayPassRevenue: number;
        transactionCount: number;
      }>();

      sessions.forEach(session => {
        if (!session.exitTime || !session.billingAmount) return;

        const periodKey = this.formatPeriodKey(session.exitTime, groupBy);
        const revenue = Number(session.billingAmount);

        if (!groupedData.has(periodKey)) {
          groupedData.set(periodKey, {
            totalRevenue: 0,
            hourlyRevenue: 0,
            dayPassRevenue: 0,
            transactionCount: 0
          });
        }

        const data = groupedData.get(periodKey)!;
        data.totalRevenue += revenue;
        data.transactionCount += 1;

        if (session.billingType === BillingType.HOURLY) {
          data.hourlyRevenue += revenue;
        } else {
          data.dayPassRevenue += revenue;
        }
      });

      // Convert to array and calculate growth rates
      const result: RevenueAnalytics[] = Array.from(groupedData.entries()).map(([period, data]) => ({
        period,
        totalRevenue: Math.round(data.totalRevenue),
        hourlyRevenue: Math.round(data.hourlyRevenue),
        dayPassRevenue: Math.round(data.dayPassRevenue),
        transactionCount: data.transactionCount,
        averageTransactionValue: data.transactionCount > 0 ? Math.round(data.totalRevenue / data.transactionCount) : 0,
        growthRate: 0 // Will be calculated separately for comparison periods
      }));

      return result.sort((a, b) => a.period.localeCompare(b.period));

    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  /**
   * Get slot utilization analytics
   */
  async getSlotUtilizationAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<SlotUtilizationAnalytics[]> {
    try {
      const { start, end } = this.getPeriodRange(period);

      // Get all slots with their sessions
      const slots = await prisma.parkingSlot.findMany({
        include: {
          sessions: {
            where: {
              entryTime: { gte: start, lte: end }
            },
            select: {
              entryTime: true,
              exitTime: true,
              billingAmount: true,
              status: true
            }
          }
        }
      });

      // Group by slot type
      const utilization = new Map<SlotType, {
        totalSlots: number;
        totalOccupiedTime: number;
        totalRevenue: number;
        peakOccupancy: number;
        sessions: number;
      }>();

      const periodMs = end.getTime() - start.getTime();

      slots.forEach(slot => {
        if (!utilization.has(slot.slotType)) {
          utilization.set(slot.slotType, {
            totalSlots: 0,
            totalOccupiedTime: 0,
            totalRevenue: 0,
            peakOccupancy: 0,
            sessions: 0
          });
        }

        const data = utilization.get(slot.slotType)!;
        data.totalSlots += 1;

        // Calculate occupied time for this slot
        let slotOccupiedTime = 0;
        slot.sessions.forEach(session => {
          const exitTime = session.exitTime || new Date(); // Use current time for active sessions
          const occupiedMs = Math.min(exitTime.getTime(), end.getTime()) - Math.max(session.entryTime.getTime(), start.getTime());
          if (occupiedMs > 0) {
            slotOccupiedTime += occupiedMs;
            data.sessions += 1;
            if (session.billingAmount) {
              data.totalRevenue += Number(session.billingAmount);
            }
          }
        });

        data.totalOccupiedTime += slotOccupiedTime;
      });

      // Convert to result format
      const result: SlotUtilizationAnalytics[] = Array.from(utilization.entries()).map(([slotType, data]) => {
        const averageOccupancy = data.totalSlots > 0 ? (data.totalOccupiedTime / (data.totalSlots * periodMs)) * 100 : 0;
        
        return {
          slotType,
          totalSlots: data.totalSlots,
          averageOccupancy: Math.round(averageOccupancy * 100) / 100,
          peakOccupancy: Math.min(100, Math.round(averageOccupancy * 1.3)), // Estimate peak as 30% higher
          totalRevenue: Math.round(data.totalRevenue),
          utilizationRate: Math.round(averageOccupancy * 100) / 100,
          revenuePerSlot: data.totalSlots > 0 ? Math.round(data.totalRevenue / data.totalSlots) : 0
        };
      });

      return result;

    } catch (error) {
      console.error('Error getting slot utilization analytics:', error);
      throw error;
    }
  }

  /**
   * Get peak hour analytics
   */
  async getPeakHourAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<PeakHourAnalytics[]> {
    try {
      const { start, end } = this.getPeriodRange(period);

      const [entrySessions, exitSessions] = await Promise.all([
        prisma.parkingSession.findMany({
          where: {
            entryTime: { gte: start, lte: end }
          },
          select: {
            entryTime: true,
            billingAmount: true,
            exitTime: true
          }
        }),
        prisma.parkingSession.findMany({
          where: {
            status: SessionStatus.COMPLETED,
            exitTime: { gte: start, lte: end, not: null }
          },
          select: {
            exitTime: true,
            entryTime: true
          }
        })
      ]);

      // Group by hour
      const hourlyData = new Map<number, {
        entries: number;
        exits: number;
        revenue: number;
        totalDuration: number;
        sessionCount: number;
      }>();

      // Initialize all hours
      for (let hour = 0; hour < 24; hour++) {
        hourlyData.set(hour, {
          entries: 0,
          exits: 0,
          revenue: 0,
          totalDuration: 0,
          sessionCount: 0
        });
      }

      // Process entries
      entrySessions.forEach(session => {
        const hour = session.entryTime.getHours();
        const data = hourlyData.get(hour)!;
        data.entries += 1;
        
        if (session.billingAmount) {
          data.revenue += Number(session.billingAmount);
        }

        if (session.exitTime) {
          const duration = session.exitTime.getTime() - session.entryTime.getTime();
          data.totalDuration += duration;
          data.sessionCount += 1;
        }
      });

      // Process exits
      exitSessions.forEach(session => {
        if (session.exitTime) {
          const hour = session.exitTime.getHours();
          const data = hourlyData.get(hour)!;
          data.exits += 1;
        }
      });

      // Get total slots for occupancy calculation
      const totalSlots = await prisma.parkingSlot.count();

      // Convert to result format
      const result: PeakHourAnalytics[] = Array.from(hourlyData.entries()).map(([hour, data]) => ({
        hour,
        entries: data.entries,
        exits: data.exits,
        revenue: Math.round(data.revenue),
        occupancyRate: Math.min(100, Math.round((data.entries / Math.max(totalSlots, 1)) * 100)),
        averageStayDuration: data.sessionCount > 0 ? Math.round(data.totalDuration / (data.sessionCount * 1000 * 60 * 60) * 100) / 100 : 0
      }));

      return result.sort((a, b) => a.hour - b.hour);

    } catch (error) {
      console.error('Error getting peak hour analytics:', error);
      throw error;
    }
  }

  /**
   * Get vehicle type analytics
   */
  async getVehicleTypeAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<VehicleTypeAnalytics[]> {
    try {
      const { start, end } = this.getPeriodRange(period);

      const sessions = await prisma.parkingSession.findMany({
        where: {
          entryTime: { gte: start, lte: end }
        },
        select: {
          entryTime: true,
          exitTime: true,
          billingAmount: true,
          vehicle: {
            select: {
              vehicleType: true
            }
          }
        }
      });

      const typeData = new Map<VehicleType, {
        count: number;
        totalRevenue: number;
        totalDuration: number;
        completedSessions: number;
      }>();

      // Initialize all vehicle types
      Object.values(VehicleType).forEach(type => {
        typeData.set(type, {
          count: 0,
          totalRevenue: 0,
          totalDuration: 0,
          completedSessions: 0
        });
      });

      sessions.forEach(session => {
        const vehicleType = session.vehicle.vehicleType;
        const data = typeData.get(vehicleType)!;
        
        data.count += 1;
        
        if (session.billingAmount) {
          data.totalRevenue += Number(session.billingAmount);
        }

        if (session.exitTime) {
          const duration = session.exitTime.getTime() - session.entryTime.getTime();
          data.totalDuration += duration;
          data.completedSessions += 1;
        }
      });

      const totalVehicles = sessions.length;

      const result: VehicleTypeAnalytics[] = Array.from(typeData.entries()).map(([vehicleType, data]) => ({
        vehicleType,
        count: data.count,
        percentage: totalVehicles > 0 ? Math.round((data.count / totalVehicles) * 100 * 100) / 100 : 0,
        averageDuration: data.completedSessions > 0 ? Math.round(data.totalDuration / (data.completedSessions * 1000 * 60 * 60) * 100) / 100 : 0,
        totalRevenue: Math.round(data.totalRevenue),
        revenuePerVehicle: data.count > 0 ? Math.round(data.totalRevenue / data.count) : 0
      }));

      return result.filter(item => item.count > 0);

    } catch (error) {
      console.error('Error getting vehicle type analytics:', error);
      throw error;
    }
  }

  /**
   * Get operational metrics
   */
  async getOperationalMetrics(period: 'day' | 'week' | 'month' = 'day'): Promise<OperationalMetrics> {
    try {
      const { start, end } = this.getPeriodRange(period);

      const [totalSessions, activeSessions, completedSessions, totalSlots] = await Promise.all([
        prisma.parkingSession.count({
          where: { entryTime: { gte: start, lte: end } }
        }),
        prisma.parkingSession.count({
          where: { 
            status: SessionStatus.ACTIVE,
            entryTime: { gte: start, lte: end }
          }
        }),
        prisma.parkingSession.findMany({
          where: {
            status: SessionStatus.COMPLETED,
            entryTime: { gte: start, lte: end },
            exitTime: { not: null }
          },
          select: {
            entryTime: true,
            exitTime: true
          }
        }),
        prisma.parkingSlot.count()
      ]);

      // Calculate average stay duration
      let totalDuration = 0;
      completedSessions.forEach(session => {
        if (session.exitTime) {
          totalDuration += session.exitTime.getTime() - session.entryTime.getTime();
        }
      });

      const averageStayDuration = completedSessions.length > 0 ? 
        totalDuration / (completedSessions.length * 1000 * 60 * 60) : 0;

      // Calculate turnover rate (sessions per slot per day)
      const periodDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      const turnoverRate = totalSlots > 0 && periodDays > 0 ? 
        totalSessions / (totalSlots * periodDays) : 0;

      // Calculate peak capacity utilization
      const peakCapacityUtilization = totalSlots > 0 ? 
        Math.min(100, (activeSessions / totalSlots) * 100) : 0;

      // Calculate overstay rate (simplified - sessions longer than 8 hours)
      const longSessions = completedSessions.filter(session => {
        if (!session.exitTime) return false;
        const duration = session.exitTime.getTime() - session.entryTime.getTime();
        return duration > (8 * 60 * 60 * 1000); // 8 hours
      }).length;

      const overstayRate = completedSessions.length > 0 ? 
        (longSessions / completedSessions.length) * 100 : 0;

      return {
        totalSessions,
        activeSessions,
        completedSessions: completedSessions.length,
        averageStayDuration: Math.round(averageStayDuration * 100) / 100,
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        peakCapacityUtilization: Math.round(peakCapacityUtilization * 100) / 100,
        overstayRate: Math.round(overstayRate * 100) / 100
      };

    } catch (error) {
      console.error('Error getting operational metrics:', error);
      throw error;
    }
  }

  /**
   * Helper method to get period range
   */
  private getPeriodRange(period: 'day' | 'week' | 'month', startDate?: Date, endDate?: Date) {
    const now = new Date();
    let start: Date;
    let end: Date = endDate || now;
    let groupBy: 'hour' | 'day' | 'week';

    if (startDate) {
      start = startDate;
      groupBy = 'day';
    } else {
      switch (period) {
        case 'day':
          start = new Date(now);
          start.setHours(0, 0, 0, 0);
          groupBy = 'hour';
          break;
        case 'week':
          start = new Date(now);
          start.setDate(now.getDate() - 7);
          start.setHours(0, 0, 0, 0);
          groupBy = 'day';
          break;
        case 'month':
          start = new Date(now);
          start.setDate(now.getDate() - 30);
          start.setHours(0, 0, 0, 0);
          groupBy = 'week';
          break;
      }
    }

    return { start, end, groupBy };
  }

  /**
   * Helper method to format period key
   */
  private formatPeriodKey(date: Date, groupBy: 'hour' | 'day' | 'week'): string {
    switch (groupBy) {
      case 'hour':
        return `${date.getHours().toString().padStart(2, '0')}:00`;
      case 'day':
        return date.toISOString().split('T')[0];
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      default:
        return date.toISOString().split('T')[0];
    }
  }
}

export const analyticsService = new AnalyticsService();