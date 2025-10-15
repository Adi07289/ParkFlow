import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api';

// Notification interfaces
export interface Notification {
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

export interface NotificationCount {
  total: number;
  overstay: number;
  other: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

// API functions
export const notificationsApi = {
  // Get all notifications
  async getNotifications(params?: {
    unreadOnly?: boolean;
    type?: 'overstay' | 'revenue' | 'system' | 'maintenance';
    limit?: number;
  }): Promise<NotificationsResponse> {
    const response = await axios.get(`${API_BASE_URL}/notifications`, { params });
    
    // Convert timestamp strings to Date objects
    const data = response.data.data;
    data.notifications = data.notifications.map((notification: Notification) => ({
      ...notification,
      timestamp: new Date(notification.timestamp)
    }));
    
    return data;
  },

  // Get notification count
  async getNotificationCount(): Promise<NotificationCount> {
    const response = await axios.get(`${API_BASE_URL}/notifications/count`);
    return response.data.data;
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_BASE_URL}/notifications/${notificationId}/mark-read`);
    return response.data;
  },

  // Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await axios.post(`${API_BASE_URL}/notifications/mark-all-read`);
    return response.data;
  },

  // Run overstay detection
  async runOverstayDetection(): Promise<{
    success: boolean;
    message: string;
    data: {
      alertsFound: number;
      notificationsSent: number;
      errors: string[];
    };
  }> {
    const response = await axios.post(`${API_BASE_URL}/notifications/run-overstay-detection`);
    return response.data;
  }
};