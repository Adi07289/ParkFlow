"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  IndianRupee, 
  Settings,
  CheckCircle,
  X,
  Bell
} from 'lucide-react';
import { formatToISTDateTime } from '@/lib/time-utils';
import { notificationsApi, Notification } from '@/lib/notifications-api';

// Interface is now imported from notifications-api

interface NotificationDropdownProps {
  onClose: () => void;
  onNotificationCountChange: (count: number) => void;
}

export function NotificationDropdown({ onClose, onNotificationCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getNotifications({ limit: 10 });
      setNotifications(response.notifications);
      onNotificationCountChange(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Fallback to empty array on error
      setNotifications([]);
      onNotificationCountChange(0);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'critical' ? 'text-red-600' : 
                     priority === 'high' ? 'text-orange-600' : 
                     priority === 'medium' ? 'text-yellow-600' : 'text-blue-600';
    
    switch (type) {
      case 'overstay':
        return <AlertTriangle className={`h-4 w-4 ${iconClass}`} />;
      case 'revenue':
        return <IndianRupee className={`h-4 w-4 ${iconClass}`} />;
      case 'system':
        return <Settings className={`h-4 w-4 ${iconClass}`} />;
      case 'maintenance':
        return <Settings className={`h-4 w-4 ${iconClass}`} />;
      default:
        return <Bell className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'secondary',
      low: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'} className="text-xs">
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markNotificationAsRead(notificationId);
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        );
        const unreadCount = updated.filter(n => !n.read).length;
        onNotificationCountChange(unreadCount);
        return updated;
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onNotificationCountChange(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return formatToISTDateTime(timestamp).date;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <div className="flex items-center space-x-2">
              {notifications.some(n => !n.read) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs h-7"
                >
                  Mark all read
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="p-1 h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              No new notifications
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getNotificationIcon(notification.type, notification.priority)}
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {getPriorityBadge(notification.priority)}
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  
                  {notification.metadata && (
                    <div className="flex flex-wrap gap-2 text-xs">
                      {notification.metadata.vehicleNumber && (
                        <Badge variant="outline" className="text-xs">
                          {notification.metadata.vehicleNumber}
                        </Badge>
                      )}
                      {notification.metadata.slotNumber && (
                        <Badge variant="outline" className="text-xs">
                          Slot: {notification.metadata.slotNumber}
                        </Badge>
                      )}
                      {notification.metadata.duration && (
                        <Badge variant="outline" className="text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.metadata.duration}
                        </Badge>
                      )}
                      {notification.metadata.amount && (
                        <Badge variant="outline" className="text-xs flex items-center">
                          <IndianRupee className="h-3 w-3 mr-1" />
                          ₹{notification.metadata.amount.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => {
                  // Navigate to notifications page
                  onClose();
                }}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}