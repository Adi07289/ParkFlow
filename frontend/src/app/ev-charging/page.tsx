"use client";

import { AxiosError } from 'axios';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation } from '@/components/navigation';
import { evApi, QueueEntry, IdleSession } from '@/lib/ev-api';
import { parkingApi, CurrentlyParkedVehicle, QuickSearchResult } from '@/lib/parking-api';
import {
  Zap,
  Clock,
  AlertTriangle,
  RefreshCw,
  Users,
  BatteryCharging,
  BatteryFull,
  IndianRupee,
  Bell,
  UserMinus
} from 'lucide-react';

export default function EVChargingPage() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [idleSessions, setIdleSessions] = useState<IdleSession[]>([]);
  const [activeEVSessions, setActiveEVSessions] = useState<CurrentlyParkedVehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [vehicleSearchResults, setVehicleSearchResults] = useState<QuickSearchResult[]>([]);
  const [vehicleIdInput, setVehicleIdInput] = useState('');
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [queueData, idleData, activeSessionsData] = await Promise.all([
        evApi.getQueue(),
        evApi.getIdleSessions(),
        parkingApi.getCurrentlyParkedVehicles({ vehicleType: 'EV', limit: 50 }),
      ]);
      setQueue(queueData.queue);
      setIdleSessions(idleData.sessions);
      setActiveEVSessions(activeSessionsData.vehicles);
    } catch (error) {
      console.error('Failed to fetch EV data:', error);
      setQueue([]);
      setIdleSessions([]);
      setActiveEVSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const searchVehicles = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setVehicleSearchResults([]);
      return;
    }

    try {
      const results = await parkingApi.quickSearch(trimmedQuery);
      setVehicleSearchResults(results.filter((vehicle) => vehicle.vehicleType === 'EV'));
    } catch (error) {
      console.error('Failed to search EV vehicles:', error);
      setVehicleSearchResults([]);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      searchVehicles(vehicleSearchQuery);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchVehicles, vehicleSearchQuery]);

  const handleJoinQueue = async () => {
    if (!vehicleIdInput.trim()) return;
    try {
      const result = await evApi.joinQueue(vehicleIdInput.trim());
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) {
        setVehicleIdInput('');
        setVehicleSearchQuery('');
        setVehicleSearchResults([]);
        fetchData();
      }
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to join queue'));
    }
  };

  const handleNotifyNext = async () => {
    try {
      const result = await evApi.notifyNext();
      showMessage(result.success ? 'success' : 'error', result.message);
      fetchData();
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to notify'));
    }
  };

  const handleMarkComplete = async () => {
    if (!sessionIdInput.trim()) return;
    try {
      const result = await evApi.markChargingComplete(sessionIdInput.trim());
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) {
        setSessionIdInput('');
        fetchData();
      }
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to mark complete'));
    }
  };

  const handleLeaveQueue = async (vehicleId: string) => {
    try {
      const result = await evApi.leaveQueue(vehicleId);
      showMessage(result.success ? 'success' : 'error', result.message);
      fetchData();
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to leave queue'));
    }
  };

  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
    switch (status) {
      case 'WAITING': return 'default';
      case 'NOTIFIED': return 'success';
      case 'EXPIRED': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
                <Zap className="h-8 w-8 mr-2 text-green-600" />
                EV Charging Management
              </h1>
              <p className="text-gray-600 mt-1">Manage EV charging queue, idle fees, and slot availability</p>
            </div>
            <Button onClick={fetchData} className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div className={`mb-4 p-4 rounded-lg ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {actionMessage.text}
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicles in Queue</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{queue.length}</div>
                <p className="text-xs text-muted-foreground">Waiting for EV slot</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Idle EVs</CardTitle>
                <BatteryFull className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{idleSessions.length}</div>
                <p className="text-xs text-muted-foreground">Fully charged, still parked</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Idle Fees</CardTitle>
                <IndianRupee className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{idleSessions.reduce((sum, s) => sum + s.currentIdleFee, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Accumulated idle fees</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Queue Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BatteryCharging className="h-5 w-5 mr-2 text-green-600" />
                  Charging Queue
                </CardTitle>
                <CardDescription>Vehicles waiting for an EV charging slot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Search EV by number plate"
                    value={vehicleSearchQuery}
                    onChange={(e) => setVehicleSearchQuery(e.target.value)}
                  />

                  {vehicleIdInput && (
                    <div className="rounded-lg border bg-green-50 p-3 text-sm text-green-900">
                      Selected vehicle ID: <span className="font-mono">{vehicleIdInput}</span>
                    </div>
                  )}

                  {vehicleSearchResults.length > 0 && (
                    <div className="space-y-2 rounded-lg border bg-white p-3">
                      <p className="text-sm font-medium text-gray-700">Matching EV vehicles</p>
                      {vehicleSearchResults.map((vehicle) => (
                        <button
                          key={vehicle.vehicleId}
                          type="button"
                          onClick={() => {
                            setVehicleIdInput(vehicle.vehicleId);
                            setVehicleSearchQuery(vehicle.numberPlate);
                            setVehicleSearchResults([]);
                          }}
                          className={`w-full rounded-lg border p-3 text-left transition-colors ${
                            vehicleIdInput === vehicle.vehicleId
                              ? 'border-green-400 bg-green-50'
                              : 'border-gray-200 hover:border-green-300 hover:bg-green-50/40'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{vehicle.numberPlate}</div>
                          <div className="font-mono text-xs text-gray-500">{vehicle.vehicleId}</div>
                          <div className="text-xs text-gray-500">
                            {vehicle.isCurrentlyParked ? `Currently parked in ${vehicle.currentSlot}` : 'Not currently parked'}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleJoinQueue} size="sm" disabled={!vehicleIdInput.trim()}>
                  Add Selected EV to Queue
                </Button>

                {/* Notify Next Button */}
                <Button onClick={handleNotifyNext} variant="outline" className="mb-4 w-full" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notify Next in Queue
                </Button>

                {/* Queue List */}
                {queue.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No vehicles in queue</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {queue.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm">#{entry.position}</span>
                            <span className="font-medium">{entry.vehicleNumberPlate}</span>
                            <Badge variant={getStatusBadgeVariant(entry.status)}>
                              {entry.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            Est. wait: ~{entry.estimatedWaitMinutes} min
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLeaveQueue(entry.vehicleId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Idle Sessions & Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
                  Idle EV Sessions
                </CardTitle>
                <CardDescription>Vehicles fully charged but still occupying a charging slot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Session ID to mark charging complete"
                      value={sessionIdInput}
                      onChange={(e) => setSessionIdInput(e.target.value)}
                    />
                    <Button onClick={handleMarkComplete} size="sm" disabled={!sessionIdInput.trim()}>
                      Complete
                    </Button>
                  </div>

                  {activeEVSessions.length > 0 && (
                    <div className="space-y-2 rounded-lg border bg-white p-3">
                      <p className="text-sm font-medium text-gray-700">Active EV sessions</p>
                      {activeEVSessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{session.vehicle.numberPlate}</div>
                            <div className="text-xs text-gray-500">Slot {session.slot.number}</div>
                            <div className="font-mono text-xs text-gray-500">{session.sessionId}</div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSessionIdInput(session.sessionId);
                            }}
                          >
                            Use This Session
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Idle sessions */}
                {idleSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BatteryFull className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No idle EV sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {idleSessions.map((session) => (
                      <div key={session.sessionId} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{session.vehicleNumberPlate}</span>
                          <Badge variant="destructive">
                            ₹{session.currentIdleFee} fee
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                          <div>Session ID: <span className="font-mono">{session.sessionId}</span></div>
                          <div>Slot: {session.slotNumber}</div>
                          <div>Idle for: {session.idleMinutes} minutes</div>
                          <div className="text-yellow-700 font-medium">
                            Status: {session.chargingStatus}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
