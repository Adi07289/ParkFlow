import {
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query,
  Path
} from 'tsoa';
import { createClient } from 'redis';
import { overstayService } from '../services/overstayService';

interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface MockNotification {
  id: string;
  type: 'overstay' | 'revenue' | 'system' | 'maintenance';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: {
    vehicleNumber?: string;
    slotNumber?: string;
    amount?: number;
    duration?: string;
  };
}

const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.connect().catch(console.error);

@Route('api/notifications')
@Tags('Notifications')
export class NotificationController extends Controller {
  private readonly READ_NOTIFICATIONS_KEY = 'notifications:read';

  private buildOverstayNotificationId(sessionId: string): string {
    return `overstay-${sessionId}`;
  }

  private async getReadNotificationIds(): Promise<Set<string>> {
    try {
      const ids = await redis.sMembers(this.READ_NOTIFICATIONS_KEY);
      return new Set(ids);
    } catch (error) {
      console.error('Failed to load read notification IDs:', error);
      return new Set();
    }
  }

  private async markNotificationIdsAsRead(notificationIds: string[]): Promise<void> {
    if (notificationIds.length === 0) {
      return;
    }

    try {
      await redis.sAdd(this.READ_NOTIFICATIONS_KEY, notificationIds);
    } catch (error) {
      console.error('Failed to persist read notifications:', error);
      throw error;
    }
  }

  /**
   * Get all notifications
   * @summary Get all notifications with filtering options
   */
  @Get('/')
  @SuccessResponse(200, 'Notifications retrieved successfully')
  public async getNotifications(
    @Query() unreadOnly?: boolean,
    @Query() type?: 'overstay' | 'revenue' | 'system' | 'maintenance',
    @Query() limit: number = 20
  ): Promise<NotificationResponse> {
    try {
      // Get overstay alerts
      const overstayAlerts = await overstayService.getOverstayAlerts();
      const readNotificationIds = await this.getReadNotificationIds();
      
      // Convert overstay alerts to notifications (ONLY REAL DATA)
      const overstayNotifications: MockNotification[] = overstayAlerts.map(alert => ({
        id: this.buildOverstayNotificationId(alert.sessionId),
        type: 'overstay' as const,
        title: `Vehicle Overstay ${alert.severity === 'critical' ? 'Critical' : 'Alert'}`,
        message: `Vehicle ${alert.vehicle.numberPlate} has been parked for ${alert.duration} in slot ${alert.slot.slotNumber}`,
        timestamp: new Date(Date.now() - (alert.overstayHours * 60 * 60 * 1000)), // When overstay started
        read: readNotificationIds.has(this.buildOverstayNotificationId(alert.sessionId)),
        priority: alert.severity === 'critical' ? 'critical' : alert.severity === 'alert' ? 'high' : 'medium',
        metadata: {
          vehicleNumber: alert.vehicle.numberPlate,
          slotNumber: alert.slot.slotNumber,
          duration: alert.duration
        }
      }));

      // Use ONLY real overstay notifications
      let allNotifications = overstayNotifications;

      // Apply filters
      if (unreadOnly) {
        allNotifications = allNotifications.filter(n => !n.read);
      }

      if (type) {
        allNotifications = allNotifications.filter(n => n.type === type);
      }

      // Sort by timestamp (newest first)
      allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Apply limit
      allNotifications = allNotifications.slice(0, limit);

      return {
        success: true,
        data: {
          notifications: allNotifications,
          unreadCount: allNotifications.filter(n => !n.read).length,
          totalCount: allNotifications.length
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve notifications'
      };
    }
  }

  /**
   * Get notification count
   * @summary Get count of unread notifications
   */
  @Get('/count')
  @SuccessResponse(200, 'Notification count retrieved successfully')
  public async getNotificationCount(): Promise<NotificationResponse> {
    try {
      const overstayAlerts = await overstayService.getOverstayAlerts();
      const readNotificationIds = await this.getReadNotificationIds();
      const unreadOverstayCount = overstayAlerts.filter(
        (alert) => !readNotificationIds.has(this.buildOverstayNotificationId(alert.sessionId))
      ).length;
      
      return {
        success: true,
        data: {
          total: unreadOverstayCount,
          overstay: unreadOverstayCount,
          other: 0,
          bySeverity: {
            critical: overstayAlerts.filter(
              (alert) => alert.severity === 'critical' && !readNotificationIds.has(this.buildOverstayNotificationId(alert.sessionId))
            ).length,
            high: overstayAlerts.filter(
              (alert) => alert.severity === 'alert' && !readNotificationIds.has(this.buildOverstayNotificationId(alert.sessionId))
            ).length,
            medium: overstayAlerts.filter(
              (alert) => alert.severity === 'warning' && !readNotificationIds.has(this.buildOverstayNotificationId(alert.sessionId))
            ).length,
            low: 0
          }
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve notification count'
      };
    }
  }

  /**
   * Mark notification as read
   * @summary Mark a specific notification as read
   */
  @Post('/{notificationId}/mark-read')
  @SuccessResponse(200, 'Notification marked as read')
  @Response(404, 'Notification not found')
  public async markNotificationAsRead(
    @Path() notificationId: string
  ): Promise<NotificationResponse> {
    try {
      await this.markNotificationIdsAsRead([notificationId]);
      
      return {
        success: true,
        message: 'Notification marked as read'
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark notification as read'
      };
    }
  }

  /**
   * Mark all notifications as read
   * @summary Mark all notifications as read
   */
  @Post('/mark-all-read')
  @SuccessResponse(200, 'All notifications marked as read')
  public async markAllNotificationsAsRead(): Promise<NotificationResponse> {
    try {
      const overstayAlerts = await overstayService.getOverstayAlerts();
      await this.markNotificationIdsAsRead(
        overstayAlerts.map((alert) => this.buildOverstayNotificationId(alert.sessionId))
      );
      
      return {
        success: true,
        message: 'All notifications marked as read'
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
      };
    }
  }

  /**
   * Run overstay detection
   * @summary Manually trigger overstay detection
   */
  @Post('/run-overstay-detection')
  @SuccessResponse(200, 'Overstay detection completed')
  public async runOverstayDetection(): Promise<NotificationResponse> {
    try {
      const result = await overstayService.runOverstayDetection();
      
      return {
        success: true,
        data: result,
        message: `Overstay detection completed. Found ${result.alertsFound} alerts, sent ${result.notificationsSent} notifications.`
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to run overstay detection'
      };
    }
  }
}
