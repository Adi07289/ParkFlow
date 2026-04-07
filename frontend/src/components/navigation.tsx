"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { LogOut, BarChart3, Settings, Home, Car, Bell, TrendingUp, Zap, ShieldAlert, Crown, ArrowLeftRight, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { notificationsApi } from '@/lib/notifications-api';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
    },
    {
      href: '/parking',
      label: 'Parking',
      icon: Car,
    },
    {
      href: '/ev-charging',
      label: 'EV Charging',
      icon: Zap,
    },
    {
      href: '/alerts',
      label: 'Alerts',
      icon: ShieldAlert,
    },
    {
      href: '/subscriptions',
      label: 'Loyalty',
      icon: Crown,
    },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/swaps',
      label: 'Swaps',
      icon: ArrowLeftRight,
    },
    {
      href: '/analytics',
      label: 'Analytics',
      icon: TrendingUp,
    },
    {
      href: '/maintenance',
      label: 'Maintenance',
      icon: Settings,
    },
  ];

  // Fetch real notification count
  useEffect(() => {
    fetchNotificationCount();
    // Set up interval to refresh notification count every 5 minutes
    const interval = setInterval(fetchNotificationCount, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const count = await notificationsApi.getNotificationCount();
      setNotificationCount(count.total);
    } catch (error) {
      console.error('Failed to fetch notification count:', error);
      // Keep previous count on error
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6 min-w-0">
          <div className="flex items-center space-x-4 min-w-0 overflow-hidden">
            <div className="flex items-center shrink-0">
              <Home className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">ParkFlow</h1>
            </div>
            <nav className="flex space-x-1 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => router.push(item.href)}
                    className="flex items-center"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Badge>
                )}
              </Button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <NotificationDropdown 
                  onClose={() => setShowNotifications(false)}
                  onNotificationCountChange={setNotificationCount}
                />
              )}
            </div>
            
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
