import { PrismaClient } from '@prisma/client';
import { SessionStatus, BillingType, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

export interface OverstayAlert {
  sessionId: string;
  vehicle: {
    numberPlate: string;
    vehicleType: VehicleType;
  };
  slot: {
    slotNumber: string;
    slotType: string;
  };
  entryTime: Date;
  duration: string;
  durationHours: number;
  billingType: BillingType;
  severity: 'warning' | 'alert' | 'critical';
  expectedDuration: number;
  overstayHours: number;
  estimatedCost: number;
}

export interface OverstayThresholds {
  billingType: BillingType;
  vehicleType: VehicleType;
  warningHours: number;
  alertHours: number;
  criticalHours: number;
}

class OverstayService {
  // Default thresholds - can be made configurable via database
  private readonly defaultThresholds: OverstayThresholds[] = [
    // Hourly billing thresholds
    { billingType: BillingType.HOURLY, vehicleType: VehicleType.CAR, warningHours: 6, alertHours: 8, criticalHours: 12 },
    { billingType: BillingType.HOURLY, vehicleType: VehicleType.BIKE, warningHours: 4, alertHours: 6, criticalHours: 8 },
    { billingType: BillingType.HOURLY, vehicleType: VehicleType.EV, warningHours: 8, alertHours: 10, criticalHours: 14 },
    { billingType: BillingType.HOURLY, vehicleType: VehicleType.HANDICAP_ACCESSIBLE, warningHours: 8, alertHours: 12, criticalHours: 16 },
    
    // Day pass thresholds
    { billingType: BillingType.DAY_PASS, vehicleType: VehicleType.CAR, warningHours: 24, alertHours: 30, criticalHours: 48 },
    { billingType: BillingType.DAY_PASS, vehicleType: VehicleType.BIKE, warningHours: 24, alertHours: 30, criticalHours: 48 },
    { billingType: BillingType.DAY_PASS, vehicleType: VehicleType.EV, warningHours: 24, alertHours: 30, criticalHours: 48 },
    { billingType: BillingType.DAY_PASS, vehicleType: VehicleType.HANDICAP_ACCESSIBLE, warningHours: 24, alertHours: 30, criticalHours: 48 },
  ];

  /**
   * Get overstay alerts for currently active sessions
   */
  async getOverstayAlerts(): Promise<OverstayAlert[]> {
    try {
      const activeSessions = await prisma.parkingSession.findMany({
        where: {
          status: SessionStatus.ACTIVE
        },
        include: {
          vehicle: true,
          slot: true
        }
      });

      const alerts: OverstayAlert[] = [];
      const now = new Date();

      for (const session of activeSessions) {
        const durationMs = now.getTime() - session.entryTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        const threshold = this.getThreshold(session.billingType, session.vehicle.vehicleType);
        if (!threshold) continue;

        let severity: 'warning' | 'alert' | 'critical' | null = null;
        let expectedDuration = 0;

        if (durationHours >= threshold.criticalHours) {
          severity = 'critical';
          expectedDuration = threshold.criticalHours;
        } else if (durationHours >= threshold.alertHours) {
          severity = 'alert';
          expectedDuration = threshold.alertHours;
        } else if (durationHours >= threshold.warningHours) {
          severity = 'warning';
          expectedDuration = threshold.warningHours;
        }

        if (severity) {
          const overstayHours = durationHours - expectedDuration;
          const estimatedCost = this.calculateEstimatedCost(durationHours, session.billingType);
          
          alerts.push({
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
            durationHours: Math.round(durationHours * 100) / 100,
            billingType: session.billingType,
            severity,
            expectedDuration,
            overstayHours: Math.round(overstayHours * 100) / 100,
            estimatedCost
          });
        }
      }

      // Sort by severity and duration (most critical first)
      return alerts.sort((a, b) => {
        const severityOrder = { critical: 3, alert: 2, warning: 1 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[b.severity] - severityOrder[a.severity];
        }
        return b.durationHours - a.durationHours;
      });

    } catch (error) {
      console.error('Error getting overstay alerts:', error);
      throw error;
    }
  }

  /**
   * Get overstay statistics
   */
  async getOverstayStats(periodDays: number = 7): Promise<{
    totalOverstays: number;
    byVehicleType: Record<string, number>;
    bySeverity: Record<string, number>;
    averageOverstayDuration: number;
    totalLostRevenue: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      // Get completed sessions that had overstays
      const completedSessions = await prisma.parkingSession.findMany({
        where: {
          status: SessionStatus.COMPLETED,
          entryTime: { gte: startDate },
          exitTime: { not: null }
        },
        include: {
          vehicle: true
        }
      });

      let totalOverstays = 0;
      const byVehicleType: Record<string, number> = {};
      const bySeverity: Record<string, number> = { warning: 0, alert: 0, critical: 0 };
      let totalOverstayHours = 0;
      let totalLostRevenue = 0;

      for (const session of completedSessions) {
        if (!session.exitTime) continue;

        const durationMs = session.exitTime.getTime() - session.entryTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        const threshold = this.getThreshold(session.billingType, session.vehicle.vehicleType);
        if (!threshold) continue;

        let severity: 'warning' | 'alert' | 'critical' | null = null;
        let expectedDuration = 0;

        if (durationHours >= threshold.criticalHours) {
          severity = 'critical';
          expectedDuration = threshold.criticalHours;
        } else if (durationHours >= threshold.alertHours) {
          severity = 'alert';
          expectedDuration = threshold.alertHours;
        } else if (durationHours >= threshold.warningHours) {
          severity = 'warning';
          expectedDuration = threshold.warningHours;
        }

        if (severity) {
          totalOverstays++;
          const vehicleType = session.vehicle.vehicleType;
          byVehicleType[vehicleType] = (byVehicleType[vehicleType] || 0) + 1;
          bySeverity[severity]++;
          
          const overstayHours = durationHours - expectedDuration;
          totalOverstayHours += overstayHours;
          
          // Estimate lost revenue (potential cost of blocked slot)
          const lostRevenue = overstayHours * 50; // Assume ₹50 per hour lost opportunity
          totalLostRevenue += lostRevenue;
        }
      }

      return {
        totalOverstays,
        byVehicleType,
        bySeverity,
        averageOverstayDuration: totalOverstays > 0 ? totalOverstayHours / totalOverstays : 0,
        totalLostRevenue: Math.round(totalLostRevenue)
      };

    } catch (error) {
      console.error('Error getting overstay stats:', error);
      throw error;
    }
  }

  /**
   * Create notification for overstay alert
   */
  async createOverstayNotification(alert: OverstayAlert): Promise<void> {
    try {
      // This would integrate with a notification service
      // For now, we'll just log it
      console.log(`Overstay ${alert.severity}: Vehicle ${alert.vehicle.numberPlate} in slot ${alert.slot.slotNumber} for ${alert.duration}`);
      
      // TODO: Integrate with notification system
      // - Send push notification to operators
      // - Create database notification record
      // - Send SMS/email alerts for critical cases
      
    } catch (error) {
      console.error('Error creating overstay notification:', error);
    }
  }

  /**
   * Run overstay detection (called by cron job)
   */
  async runOverstayDetection(): Promise<{
    alertsFound: number;
    notificationsSent: number;
    errors: string[];
  }> {
    try {
      const alerts = await this.getOverstayAlerts();
      const errors: string[] = [];
      let notificationsSent = 0;

      for (const alert of alerts) {
        try {
          await this.createOverstayNotification(alert);
          notificationsSent++;
        } catch (error) {
          errors.push(`Failed to send notification for session ${alert.sessionId}: ${error}`);
        }
      }

      return {
        alertsFound: alerts.length,
        notificationsSent,
        errors
      };

    } catch (error) {
      console.error('Error running overstay detection:', error);
      return {
        alertsFound: 0,
        notificationsSent: 0,
        errors: [`Failed to run overstay detection: ${error}`]
      };
    }
  }

  /**
   * Get threshold for vehicle and billing type
   */
  private getThreshold(billingType: BillingType, vehicleType: VehicleType): OverstayThresholds | null {
    return this.defaultThresholds.find(
      t => t.billingType === billingType && t.vehicleType === vehicleType
    ) || null;
  }

  /**
   * Calculate estimated cost based on duration and billing type
   */
  private calculateEstimatedCost(durationHours: number, billingType: BillingType): number {
    // Simple cost estimation - should be replaced with actual billing logic
    if (billingType === BillingType.DAY_PASS) {
      return Math.ceil(durationHours / 24) * 200; // ₹200 per day
    } else {
      return Math.ceil(durationHours) * 50; // ₹50 per hour
    }
  }

  /**
   * Format duration from milliseconds to human readable string
   */
  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}

export const overstayService = new OverstayService();