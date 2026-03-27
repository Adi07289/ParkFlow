"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation } from '@/components/navigation';
import { evApi, QueueEntry, IdleSession } from '@/lib/ev-api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [vehicleIdInput, setVehicleIdInput] = useState('');
  const [sessionIdInput, setSessionIdInput] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [queueData, idleData] = await Promise.all([
        evApi.getQueue(),
        evApi.getIdleSessions(),
      ]);
      setQueue(queueData.queue);
      setIdleSessions(idleData.sessions);
    } catch (error) {
      console.error('Failed to fetch EV data:', error);
      setQueue([]);
      setIdleSessions([]);
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

  const handleJoinQueue = async () => {
    if (!vehicleIdInput.trim()) return;
    try {
      const result = await evApi.joinQueue(vehicleIdInput.trim());
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) {
        setVehicleIdInput('');
        fetchData();
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to join queue');
    }
  };

  const handleNotifyNext = async () => {
    try {
      const result = await evApi.notifyNext();
      showMessage(result.success ? 'success' : 'error', result.message);
      fetchData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to notify');
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
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to mark complete');
    }
  };

  const handleLeaveQueue = async (vehicleId: string) => {
    try {
      const result = await evApi.leaveQueue(vehicleId);
      showMessage(result.success ? 'success' : 'error', result.message);
      fetchData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to leave queue');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
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
              <CardContent>
                {/* Join Queue */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Vehicle ID to add to queue"
                    value={vehicleIdInput}
                    onChange={(e) => setVehicleIdInput(e.target.value)}
                  />
                  <Button onClick={handleJoinQueue} size="sm">Add</Button>
                </div>

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
                            <Badge variant={getStatusBadgeVariant(entry.status) as any}>
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
              <CardContent>
                {/* Mark Complete */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Session ID to mark charging complete"
                    value={sessionIdInput}
                    onChange={(e) => setSessionIdInput(e.target.value)}
                  />
                  <Button onClick={handleMarkComplete} size="sm">Complete</Button>
                </div>

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
