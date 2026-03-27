"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Navigation } from '@/components/navigation';
import { VehicleSearch } from '@/components/vehicle-search';
import { CurrentSessions } from '@/components/current-sessions';
import { PastSessions } from '@/components/past-sessions';
import { BillingRatesComponent } from '@/components/billing-rates';
import { dashboardApi, DashboardStats, RevenueStats, ActivityStats } from '@/lib/dashboard-api';
import { formatToISTTimeOnly } from '@/lib/time-utils';
import { 
  BarChart3, 
  IndianRupee, 
  TrendingUp, 
  Activity, 
  Car, 
  Bike, 
  Zap, 
  Accessibility,
  RefreshCw,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

export default function DashboardPage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedView, setSelectedView] = useState<'overview' | 'search' | 'sessions' | 'past' | 'billing'>('overview');

  // Auth check removed - open access mode
  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     router.replace('/auth/login');
  //   }
  // }, [loading, isAuthenticated, router]);

  useEffect(() => {
    // Always fetch data in open access mode
    fetchDashboardData();
    // Auto-refresh disabled
    // const interval = setInterval(fetchDashboardData, 30000);
    // return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching dashboard data...');
      
      const [stats, revenue, activity] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getRevenue(),
        dashboardApi.getActivity(),
      ]);
      
      console.log('Dashboard data fetched successfully:', { stats, revenue, activity });
      
      setDashboardStats(stats);
      setRevenueStats(revenue);
      setActivityStats(activity);
      setLastUpdated(new Date());
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set fallback data to prevent infinite loading
      setDashboardStats({
        totalSlots: 0,
        occupiedSlots: 0,
        availableSlots: 0,
        maintenanceSlots: 0,
        occupancyRate: 0,
        slotsByType: [],
        vehiclesByType: []
      });
      setRevenueStats({
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        byBillingType: { hourly: 0, dayPass: 0 },
        currency: '₹'
      });
      setActivityStats({
        entriesLastHour: 0,
        exitsLastHour: 0,
        averageParkingDuration: '0h 0m',
        peakHours: []
      });
    } finally {
      setIsLoading(false);
      console.log('Dashboard loading complete');
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'CAR':
        return Car;
      case 'BIKE':
        return Bike;
      case 'EV':
        return Zap;
      case 'HANDICAP_ACCESSIBLE':
        return Accessibility;
      default:
        return Car;
    }
  };

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case 'REGULAR':
        return 'bg-blue-500';
      case 'COMPACT':
        return 'bg-green-500';
      case 'EV':
        return 'bg-yellow-500';
      case 'HANDICAP_ACCESSIBLE':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header with tabs and refresh */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parking Dashboard</h1>
              <p className="text-gray-600 flex items-center mt-1">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: {formatToISTTimeOnly(lastUpdated)} IST
              </p>
            </div>
            <Button
              onClick={fetchDashboardData}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* View Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'overview'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Overview
            </button>
            <button
              onClick={() => setSelectedView('search')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'search'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MapPin className="h-4 w-4 mr-2 inline" />
              Vehicle Search
            </button>
            <button
              onClick={() => setSelectedView('sessions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'sessions'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Activity className="h-4 w-4 mr-2 inline" />
              Current Sessions
            </button>
            <button
              onClick={() => setSelectedView('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'past'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="h-4 w-4 mr-2 inline" />
              Past Sessions
            </button>
            <button
              onClick={() => setSelectedView('billing')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'billing'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IndianRupee className="h-4 w-4 mr-2 inline" />
              Billing & Rates
            </button>
          </div>

          {/* Always show quick stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats?.totalSlots || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Available: {dashboardStats?.availableSlots || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <Car className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{dashboardStats?.occupiedSlots || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Rate: {dashboardStats?.occupancyRate?.toFixed(1) || 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{dashboardStats?.maintenanceSlots || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Slots under maintenance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{revenueStats?.currency || '₹'}{revenueStats?.today || 0}</div>
                <p className="text-xs text-muted-foreground">
                  This week: {revenueStats?.currency || '₹'}{revenueStats?.thisWeek || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Content based on selected view */}
          {selectedView === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Slots by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Slots by Type</CardTitle>
                  <CardDescription>Distribution and occupancy by slot type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats?.slotsByType.map((slot) => (
                      <div key={slot.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${getSlotTypeColor(slot.type)}`} />
                            <span className="text-sm font-medium">{slot.type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-sm font-medium">{slot.occupied}/{slot.total}</span>
                        </div>
                        <div className="flex space-x-1 text-xs">
                          <Badge variant="success" className="text-xs">
                            {slot.available} Available
                          </Badge>
                          {slot.maintenance > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {slot.maintenance} Maintenance
                            </Badge>
                          )}
                        </div>
                        <Progress 
                          value={(slot.occupied / slot.total) * 100} 
                          className="h-2" 
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Vehicles by Type */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Vehicles</CardTitle>
                  <CardDescription>Vehicles currently parked by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardStats?.vehiclesByType.map((vehicle) => {
                      const Icon = getVehicleIcon(vehicle.type);
                      return (
                        <div key={vehicle.type} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className="w-5 h-5 mr-3 text-gray-600" />
                            <span className="text-sm font-medium">{vehicle.type.replace('_', ' ')}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{vehicle.count}</div>
                            <div className="text-xs text-gray-500">
                              {vehicle.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Revenue by billing type and period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-900">Hourly</div>
                        <div className="text-lg font-bold text-blue-800">
                          {revenueStats?.currency || '₹'}{revenueStats?.byBillingType.hourly || 0}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-900">Day Pass</div>
                        <div className="text-lg font-bold text-green-800">
                          {revenueStats?.currency || '₹'}{revenueStats?.byBillingType.dayPass || 0}
                        </div>
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">This Week</span>
                        <span className="font-medium">{revenueStats?.currency || '₹'}{revenueStats?.thisWeek || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">This Month</span>
                        <span className="font-medium">{revenueStats?.currency || '₹'}{revenueStats?.thisMonth || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity & Peak Hours */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Activity & Peak Hours</CardTitle>
                  <CardDescription>
                    Recent activity and busiest hours (Average duration: {activityStats?.averageParkingDuration || '0h 0m'})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-sm text-green-900">Entries (Last Hour)</div>
                        <div className="text-2xl font-bold text-green-800">{activityStats?.entriesLastHour || 0}</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-sm text-blue-900">Exits (Last Hour)</div>
                        <div className="text-2xl font-bold text-blue-800">{activityStats?.exitsLastHour || 0}</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-sm text-purple-900">Net Change</div>
                        <div className="text-2xl font-bold text-purple-800">
                          {(activityStats?.entriesLastHour || 0) - (activityStats?.exitsLastHour || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Peak Hours Chart */}
                    <div>
                      <div className="text-sm font-medium mb-3">Peak Hours Today</div>
                      <div className="grid grid-cols-12 gap-1">
                        {activityStats?.peakHours.slice(0, 12).map((hour) => (
                          <div key={hour.hour} className="text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              {String(hour.hour).padStart(2, '0')}:00
                            </div>
                            <div className="h-16 bg-gray-100 rounded relative overflow-hidden">
                              <div
                                className="absolute bottom-0 w-full bg-blue-500 transition-all duration-300"
                                style={{
                                  height: `${Math.max((hour.entries / Math.max(...(activityStats?.peakHours.map(h => h.entries) || [1]))) * 100, 5)}%`
                                }}
                              />
                            </div>
                            <div className="text-xs font-medium mt-1">{hour.entries}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedView === 'search' && (
            <VehicleSearch />
          )}

          {selectedView === 'sessions' && (
            <CurrentSessions refreshTrigger={refreshTrigger} />
          )}

          {selectedView === 'past' && (
            <PastSessions refreshTrigger={refreshTrigger} />
          )}

          {selectedView === 'billing' && (
            <BillingRatesComponent />
          )}
        </div>
      </main>
    </div>
  );
}