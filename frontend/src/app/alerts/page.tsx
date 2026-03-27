"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { alertsApi, ParkingAlertItem, AlertStats } from '@/lib/alerts-api';
import {
  ShieldAlert,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Scan,
  Users,
  Clock,
  Car
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<ParkingAlertItem[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const isResolved = activeFilter === 'all' ? undefined : activeFilter === 'resolved';
      const [alertData, statsData] = await Promise.all([
        alertsApi.getAlerts({ isResolved, page: 1, limit: 50 }),
        alertsApi.getAlertStats(7),
      ]);
      setAlerts(alertData.alerts);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleScan = async () => {
    try {
      const result = await alertsApi.triggerScan();
      showMessage('success', result.message);
      fetchData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Scan failed');
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      const result = await alertsApi.resolveAlert(alertId, 'admin');
      showMessage(result.success ? 'success' : 'error', result.message);
      fetchData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to resolve');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERSTAY': return Clock;
      case 'UNAUTHORIZED_AREA': return AlertOctagon;
      case 'RAPID_ENTRY': return Car;
      case 'REPEATED_OFFENDER': return Users;
      default: return AlertTriangle;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShieldAlert className="h-8 w-8 mr-2 text-red-600" />
                Safety & Alert System
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage parking anomalies and security alerts</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleScan} variant="outline" className="flex items-center">
                <Scan className="h-4 w-4 mr-2" />
                Run Scan
              </Button>
              <Button onClick={fetchData} className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div className={`mb-4 p-4 rounded-lg ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {actionMessage.text}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats?.totalActive || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved (7d)</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.totalResolved || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical</CardTitle>
                <AlertOctagon className="h-4 w-4 text-red-800" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-800">{stats?.bySeverity?.CRITICAL || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats?.bySeverity?.HIGH || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg w-fit">
            {(['active', 'resolved', 'all'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-white text-red-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>{alerts.length} alerts shown</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ShieldAlert className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">No alerts found</p>
                  <p className="text-sm">Run a scan to detect anomalies</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => {
                    const Icon = getAlertTypeIcon(alert.alertType);
                    return (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border ${alert.isResolved ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 mt-0.5 ${alert.isResolved ? 'text-gray-400' : 'text-red-600'}`} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge className={getSeverityColor(alert.severity)}>
                                  {alert.severity}
                                </Badge>
                                <Badge variant="outline">{alert.alertType.replace('_', ' ')}</Badge>
                                {alert.isResolved && (
                                  <Badge variant="secondary">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Resolved
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-800">{alert.message}</p>
                              <div className="flex gap-4 text-xs text-gray-500 mt-2">
                                {alert.vehicle && (
                                  <span>Vehicle: {alert.vehicle.numberPlate}</span>
                                )}
                                {alert.slot && (
                                  <span>Slot: {alert.slot.slotNumber}</span>
                                )}
                                <span>{new Date(alert.createdAt).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          {!alert.isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResolve(alert.id)}
                              className="text-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
