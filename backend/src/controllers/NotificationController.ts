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

@Route('api/notifications')
@Tags('Notifications')
export class NotificationController extends Controller {

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
      
      // Convert overstay alerts to notifications (ONLY REAL DATA)
      const overstayNotifications: MockNotification[] = overstayAlerts.map(alert => ({
        id: `overstay-${alert.sessionId}`,
        type: 'overstay' as const,
        title: `Vehicle Overstay ${alert.severity === 'critical' ? 'Critical' : 'Alert'}`,
        message: `Vehicle ${alert.vehicle.numberPlate} has been parked for ${alert.duration} in slot ${alert.slot.slotNumber}`,
        timestamp: new Date(Date.now() - (alert.overstayHours * 60 * 60 * 1000)), // When overstay started
        read: false,
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
      
      return {
        success: true,
        data: {
          total: overstayAlerts.length,
          overstay: overstayAlerts.length,
          other: 0,
          bySeverity: {
            critical: overstayAlerts.filter(a => a.severity === 'critical').length,
            high: overstayAlerts.filter(a => a.severity === 'alert').length,
            medium: overstayAlerts.filter(a => a.severity === 'warning').length,
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
      // In a real implementation, this would update the database
      // For now, we'll just return success
      
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
      // In a real implementation, this would update the database
      // For now, we'll just return success
      
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