import { PrismaClient } from '@prisma/client';
import { AlertType, AlertSeverity, SessionStatus, SlotStatus, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

interface AlertFilters {
  alertType?: AlertType;
  severity?: AlertSeverity;
  isResolved?: boolean;
  page: number;
  limit: number;
}

class AlertService {
  // Thresholds for anomaly detection
  private readonly OVERSTAY_WARNING_HOURS = 6;
  private readonly OVERSTAY_ALERT_HOURS = 12;
  private readonly OVERSTAY_CRITICAL_HOURS = 24;
  private readonly RAPID_ENTRY_THRESHOLD_SECONDS = 30; // Entry-to-session creation under 30s is suspicious
  private readonly REPEAT_OFFENDER_THRESHOLD = 3;       // 3+ alerts in 30 days

  /**
   * Run a full anomaly detection scan on all active sessions
   */
  async detectAnomalies(): Promise<{
    alertsCreated: number;
    alertsByType: Record<string, number>;
    errors: string[];
  }> {
    const results = {
      alertsCreated: 0,
      alertsByType: {} as Record<string, number>,
      errors: [] as string[]
    };

    try {
      // 1. Detect overstay violations
      const overstayAlerts = await this.detectOverstayViolations();
      results.alertsCreated += overstayAlerts;
      results.alertsByType['OVERSTAY'] = overstayAlerts;

      // 2. Detect unauthorized area parking
      const unauthorizedAlerts = await this.detectUnauthorizedParking();
      results.alertsCreated += unauthorizedAlerts;
      results.alertsByType['UNAUTHORIZED_AREA'] = unauthorizedAlerts;

      // 3. Detect rapid entry patterns
      const rapidAlerts = await this.detectRapidEntry();
      results.alertsCreated += rapidAlerts;
      results.alertsByType['RAPID_ENTRY'] = rapidAlerts;

      // 4. Flag repeat offenders
      const offenderAlerts = await this.flagRepeatOffenders();
      results.alertsCreated += offenderAlerts;
      results.alertsByType['REPEATED_OFFENDER'] = offenderAlerts;

    } catch (error) {
      results.errors.push(`Detection scan error: ${error}`);
    }

    return results;
  }

  /**
   * Get alerts with filters and pagination
   */
  async getAlerts(filters: AlertFilters) {
    try {
      const where: any = {};
      if (filters.alertType) where.alertType = filters.alertType;
      if (filters.severity) where.severity = filters.severity;
      if (filters.isResolved !== undefined) where.isResolved = filters.isResolved;

      const [alerts, total] = await Promise.all([
        prisma.parkingAlert.findMany({
          where,
          include: {
            session: {
              include: {
                vehicle: true,
                slot: true
              }
            },
            vehicle: true
          },
          orderBy: [
            { isResolved: 'asc' },
            { createdAt: 'desc' }
          ],
          skip: (filters.page - 1) * filters.limit,
          take: filters.limit
        }),
        prisma.parkingAlert.count({ where })
      ]);

      return {
        alerts: alerts.map(alert => ({
          id: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          message: alert.message,
          isResolved: alert.isResolved,
          resolvedBy: alert.resolvedBy,
          resolvedAt: alert.resolvedAt,
          createdAt: alert.createdAt,
          vehicle: alert.vehicle ? {
            numberPlate: alert.vehicle.numberPlate,
            vehicleType: alert.vehicle.vehicleType
          } : alert.session?.vehicle ? {
            numberPlate: alert.session.vehicle.numberPlate,
            vehicleType: alert.session.vehicle.vehicleType
          } : null,
          slot: alert.session?.slot ? {
            slotNumber: alert.session.slot.slotNumber,
            slotType: alert.session.slot.slotType
          } : null
        })),
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert statistics for admin dashboard
   */
  async getAlertStats(periodDays: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);

      const [
        totalActive,
        totalResolved,
        byType,
        bySeverity
      ] = await Promise.all([
        prisma.parkingAlert.count({
          where: { isResolved: false, createdAt: { gte: startDate } }
        }),
        prisma.parkingAlert.count({
          where: { isResolved: true, createdAt: { gte: startDate } }
        }),
        prisma.parkingAlert.groupBy({
          by: ['alertType'],
          where: { createdAt: { gte: startDate } },
          _count: { id: true }
        }),
        prisma.parkingAlert.groupBy({
          by: ['severity'],
          where: { isResolved: false, createdAt: { gte: startDate } },
          _count: { id: true }
        })
      ]);

      return {
        periodDays,
        totalActive,
        totalResolved,
        byType: byType.reduce((acc, item) => {
          acc[item.alertType] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        bySeverity: bySeverity.reduce((acc, item) => {
          acc[item.severity] = item._count.id;
          return acc;
        }, {} as Record<string, number>)
      };
    } catch (error) {
      console.error('Error getting alert stats:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, resolvedBy: string): Promise<{ success: boolean; message: string }> {
    try {
      const alert = await prisma.parkingAlert.findUnique({ where: { id: alertId } });
      if (!alert) {
        return { success: false, message: 'Alert not found' };
      }
      if (alert.isResolved) {
        return { success: false, message: 'Alert is already resolved' };
      }

      await prisma.parkingAlert.update({
        where: { id: alertId },
        data: {
          isResolved: true,
          resolvedBy,
          resolvedAt: new Date()
        }
      });

      return { success: true, message: 'Alert resolved successfully' };
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Create a manual alert
   */
  async createManualAlert(data: {
    sessionId?: string;
    vehicleId?: string;
    severity: AlertSeverity;
    message: string;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const alert = await prisma.parkingAlert.create({
        data: {
          sessionId: data.sessionId,
          vehicleId: data.vehicleId,
          alertType: AlertType.MANUAL,
          severity: data.severity,
          message: data.message
        }
      });

      return {
        success: true,
        message: 'Manual alert created',
        data: { alertId: alert.id }
      };
    } catch (error) {
      console.error('Error creating manual alert:', error);
      throw error;
    }
  }

  /**
   * Get repeat offender vehicles
   */
  async getRepeatOffenders(threshold: number = 3) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const alertCounts = await prisma.parkingAlert.groupBy({
        by: ['vehicleId'],
        where: {
          vehicleId: { not: null },
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: { id: true },
        having: {
          id: { _count: { gte: threshold } }
        }
      });

      const offenders = await Promise.all(
        alertCounts.map(async (entry) => {
          if (!entry.vehicleId) return null;
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: entry.vehicleId }
          });
          return vehicle ? {
            vehicleId: vehicle.id,
            numberPlate: vehicle.numberPlate,
            vehicleType: vehicle.vehicleType,
            alertCount: entry._count.id
          } : null;
        })
      );

      return offenders.filter(Boolean);
    } catch (error) {
      console.error('Error getting repeat offenders:', error);
      throw error;
    }
  }

  // ─── Private Detection Methods ────────────────────────────────

  private async detectOverstayViolations(): Promise<number> {
    let alertsCreated = 0;
    const now = new Date();

    const activeSessions = await prisma.parkingSession.findMany({
      where: { status: SessionStatus.ACTIVE },
      include: { vehicle: true, slot: true }
    });

    for (const session of activeSessions) {
      const durationHours = (now.getTime() - session.entryTime.getTime()) / (1000 * 60 * 60);

      let severity: AlertSeverity | null = null;
      if (durationHours >= this.OVERSTAY_CRITICAL_HOURS) {
        severity = AlertSeverity.CRITICAL;
      } else if (durationHours >= this.OVERSTAY_ALERT_HOURS) {
        severity = AlertSeverity.HIGH;
      } else if (durationHours >= this.OVERSTAY_WARNING_HOURS) {
        severity = AlertSeverity.MEDIUM;
      }

      if (severity) {
        // Check if we already have an unresolved alert for this session
        const existing = await prisma.parkingAlert.findFirst({
          where: {
            sessionId: session.id,
            alertType: AlertType.OVERSTAY,
            isResolved: false
          }
        });

        if (!existing) {
          await prisma.parkingAlert.create({
            data: {
              sessionId: session.id,
              vehicleId: session.vehicleId,
              alertType: AlertType.OVERSTAY,
              severity,
              message: `Vehicle ${session.vehicle.numberPlate} has been parked for ${Math.floor(durationHours)}h in slot ${session.slot.slotNumber}`
            }
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }

  private async detectUnauthorizedParking(): Promise<number> {
    let alertsCreated = 0;

    // Check for vehicle type / slot type mismatches in active sessions
    const activeSessions = await prisma.parkingSession.findMany({
      where: { status: SessionStatus.ACTIVE },
      include: { vehicle: true, slot: true }
    });

    for (const session of activeSessions) {
      let isUnauthorized = false;

      // Non-EV in EV slot
      if (session.slot.slotType === 'EV' && session.vehicle.vehicleType !== VehicleType.EV) {
        isUnauthorized = true;
      }
      // Non-handicap vehicle in handicap slot
      if (session.slot.slotType === 'HANDICAP_ACCESSIBLE' && session.vehicle.vehicleType !== VehicleType.HANDICAP_ACCESSIBLE) {
        isUnauthorized = true;
      }

      if (isUnauthorized) {
        const existing = await prisma.parkingAlert.findFirst({
          where: {
            sessionId: session.id,
            alertType: AlertType.UNAUTHORIZED_AREA,
            isResolved: false
          }
        });

        if (!existing) {
          await prisma.parkingAlert.create({
            data: {
              sessionId: session.id,
              vehicleId: session.vehicleId,
              alertType: AlertType.UNAUTHORIZED_AREA,
              severity: AlertSeverity.HIGH,
              message: `${session.vehicle.vehicleType} vehicle (${session.vehicle.numberPlate}) parked in ${session.slot.slotType} slot ${session.slot.slotNumber}`
            }
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }

  private async detectRapidEntry(): Promise<number> {
    let alertsCreated = 0;

    // Look for sessions created in the last hour with suspicious speed
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentSessions = await prisma.parkingSession.findMany({
      where: {
        createdAt: { gte: oneHourAgo },
        status: SessionStatus.ACTIVE
      },
      include: { vehicle: true, slot: true },
      orderBy: { createdAt: 'desc' }
    });

    // Check for same vehicle multiple entries in short time
    const vehicleEntries = new Map<string, typeof recentSessions>();
    for (const session of recentSessions) {
      const key = session.vehicleId;
      if (!vehicleEntries.has(key)) {
        vehicleEntries.set(key, []);
      }
      vehicleEntries.get(key)!.push(session);
    }

    for (const [vehicleId, sessions] of vehicleEntries) {
      if (sessions.length > 1) {
        const existing = await prisma.parkingAlert.findFirst({
          where: {
            vehicleId,
            alertType: AlertType.RAPID_ENTRY,
            isResolved: false,
            createdAt: { gte: oneHourAgo }
          }
        });

        if (!existing) {
          const vehicle = sessions[0].vehicle;
          await prisma.parkingAlert.create({
            data: {
              vehicleId,
              alertType: AlertType.RAPID_ENTRY,
              severity: AlertSeverity.MEDIUM,
              message: `Vehicle ${vehicle.numberPlate} has ${sessions.length} sessions created within the last hour — possible anomaly`
            }
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }

  private async flagRepeatOffenders(): Promise<number> {
    let alertsCreated = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const alertCounts = await prisma.parkingAlert.groupBy({
      by: ['vehicleId'],
      where: {
        vehicleId: { not: null },
        alertType: { not: AlertType.REPEATED_OFFENDER },
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    });

    for (const entry of alertCounts) {
      if (!entry.vehicleId || entry._count.id < this.REPEAT_OFFENDER_THRESHOLD) continue;

      const existing = await prisma.parkingAlert.findFirst({
        where: {
          vehicleId: entry.vehicleId,
          alertType: AlertType.REPEATED_OFFENDER,
          isResolved: false,
          createdAt: { gte: thirtyDaysAgo }
        }
      });

      if (!existing) {
        const vehicle = await prisma.vehicle.findUnique({ where: { id: entry.vehicleId } });
        if (vehicle) {
          await prisma.parkingAlert.create({
            data: {
              vehicleId: entry.vehicleId,
              alertType: AlertType.REPEATED_OFFENDER,
              severity: AlertSeverity.CRITICAL,
              message: `Vehicle ${vehicle.numberPlate} has ${entry._count.id} alerts in the last 30 days — repeat offender`
            }
          });
          alertsCreated++;
        }
      }
    }

    return alertsCreated;
  }
}

export const alertService = new AlertService();
