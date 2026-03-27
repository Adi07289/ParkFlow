"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  IndianRupee, 
  BarChart3, 
  Clock, 
  MapPin,
  Car,
  Bike,
  Zap,
  Accessibility,
  RefreshCw,
  Calendar,
  Download
} from 'lucide-react';
import { formatToISTDateTime } from '@/lib/time-utils';
import { analyticsApi, RevenueAnalytics, SlotUtilizationAnalytics, PeakHourAnalytics } from '@/lib/analytics-api';

// Interfaces for component data formatting
interface RevenueData {
  period: string;
  hourly: number;
  dayPass: number;
  total: number;
}

interface SlotUtilization {
  slotType: string;
  totalSlots: number;
  avgOccupancy: number;
  peakOccupancy: number;
  revenue: number;
}

interface PeakHour {
  hour: number;
  entries: number;
  revenue: number;
  occupancyRate: number;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Real data from API
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [slotUtilization, setSlotUtilization] = useState<SlotUtilization[]>([]);
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);

  // Load data on component mount and period change
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [revenueResponse, utilizationResponse, peakHoursResponse] = await Promise.all([
        analyticsApi.getRevenueAnalytics({ period: selectedPeriod }),
        analyticsApi.getSlotUtilizationAnalytics(selectedPeriod),
        analyticsApi.getPeakHoursAnalytics(selectedPeriod)
      ]);

      // Transform revenue data for component
      const transformedRevenue: RevenueData[] = revenueResponse.map(item => ({
        period: item.period,
        hourly: item.hourlyRevenue,
        dayPass: item.dayPassRevenue,
        total: item.totalRevenue
      }));

      // Transform slot utilization data
      const transformedUtilization: SlotUtilization[] = utilizationResponse.map(item => ({
        slotType: item.slotType,
        totalSlots: item.totalSlots,
        avgOccupancy: item.averageOccupancy,
        peakOccupancy: item.peakOccupancy,
        revenue: item.totalRevenue
      }));

      // Transform peak hours data
      const transformedPeakHours: PeakHour[] = peakHoursResponse.map(item => ({
        hour: item.hour,
        entries: item.entries,
        revenue: item.revenue,
        occupancyRate: item.occupancyRate
      }));

      setRevenueData(transformedRevenue);
      setSlotUtilization(transformedUtilization);
      setPeakHours(transformedPeakHours);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0);
  const totalHourlyRevenue = revenueData.reduce((sum, item) => sum + item.hourly, 0);
  const totalDayPassRevenue = revenueData.reduce((sum, item) => sum + item.dayPass, 0);

  const getSlotTypeIcon = (type: string) => {
    switch (type) {
      case 'REGULAR':
        return Car;
      case 'COMPACT':
        return Car;
      case 'EV':
        return Zap;
      case 'HANDICAP_ACCESSIBLE':
        return Accessibility;
      default:
        return MapPin;
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

  const refreshData = () => {
    fetchAnalyticsData();
  };

  const exportData = () => {
    // Mock export functionality
    const data = {
      period: selectedPeriod,
      revenue: revenueData,
      slotUtilization,
      peakHours,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-red-600 text-sm">{error}</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshData}
                  className="text-red-600 hover:text-red-800"
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-8 w-8 mr-3 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Last updated: {formatToISTDateTime(lastUpdated).time} IST
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Select value={selectedPeriod} onValueChange={(value: 'day' | 'week' | 'month') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportData} className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={refreshData} disabled={isLoading} className="flex items-center">
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last {selectedPeriod}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hourly Revenue</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">₹{totalHourlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {((totalHourlyRevenue / totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Day Pass Revenue</CardTitle>
                <Calendar className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">₹{totalDayPassRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {((totalDayPassRevenue / totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Peak Occupancy</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {peakHours.length > 0 ? Math.max(...peakHours.map(p => p.occupancyRate)) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {peakHours.length > 0 ? 
                    `at ${peakHours.find(p => p.occupancyRate === Math.max(...peakHours.map(ph => ph.occupancyRate)))?.hour}:00` :
                    'No data available'
                  }
                </p>
              </CardContent>
            </Card>
            </>
          )}
          </div>

          {/* Revenue Chart */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Hourly vs Day Pass revenue comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.period}</span>
                      <span className="text-sm font-bold">₹{item.total.toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="absolute left-0 top-0 h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${(item.hourly / item.total) * 100}%` }}
                        />
                        <div 
                          className="absolute top-0 h-full bg-purple-500 rounded-full transition-all"
                          style={{ 
                            left: `${(item.hourly / item.total) * 100}%`,
                            width: `${(item.dayPass / item.total) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Hourly: ₹{item.hourly.toLocaleString()}</span>
                      <span>Day Pass: ₹{item.dayPass.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center space-x-6 mt-6">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Hourly Billing</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                  <span className="text-sm">Day Pass Billing</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot Utilization and Peak Hours */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Slot Utilization */}
            <Card>
              <CardHeader>
                <CardTitle>Slot Utilization</CardTitle>
                <CardDescription>Efficiency by slot type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slotUtilization.map((slot, index) => {
                    const Icon = getSlotTypeIcon(slot.slotType);
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2 text-gray-600" />
                            <span className="text-sm font-medium">
                              {slot.slotType.replace('_', ' ')}
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {slot.totalSlots} slots
                            </Badge>
                          </div>
                          <span className="text-sm font-bold">
                            ₹{slot.revenue.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                            <div 
                              className={`absolute left-0 top-0 h-full ${getSlotTypeColor(slot.slotType)} rounded-full transition-all`}
                              style={{ width: `${slot.avgOccupancy}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Avg: {slot.avgOccupancy}%</span>
                          <span>Peak: {slot.peakOccupancy}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Peak Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Analysis</CardTitle>
                <CardDescription>Busiest hours and revenue patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-blue-800">
                            {String(hour.hour).padStart(2, '0')}:00
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{hour.entries} vehicles</div>
                          <div className="text-xs text-gray-500">{hour.occupancyRate}% occupied</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">
                          ₹{hour.revenue.toLocaleString()}
                        </div>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                          <div 
                            className="bg-green-500 rounded-full h-1 transition-all"
                            style={{ width: `${(hour.revenue / Math.max(...peakHours.map(p => p.revenue))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Underutilized Slots */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Insights</CardTitle>
              <CardDescription>Areas for operational improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">Low Utilization</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Handicap accessible slots showing only 25% average occupancy
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Consider pricing adjustment
                  </Badge>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">High Demand</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Regular slots reaching 95% peak occupancy
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Revenue opportunity
                  </Badge>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">Peak Time</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    6 PM shows highest activity with 35 vehicles/hour
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    Staff optimization needed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}