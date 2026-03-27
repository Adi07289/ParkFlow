"use client";

import { useState } from 'react';
import { Navigation } from '@/components/navigation';
import { VehicleEntryForm } from '@/components/parking/vehicle-entry-form';
import { AssignmentResult } from '@/components/parking/assignment-result';
import { VehicleExitForm } from '@/components/parking/vehicle-exit-form';
import { ExitResult } from '@/components/parking/exit-result';
import { LogIn, LogOut, BarChart3 } from 'lucide-react';

interface AssignmentData {
  sessionId: string;
  vehicleId: string;
  slotId: string;
  slotNumber: string;
  entryTime: string;
  billingType: 'HOURLY' | 'DAY_PASS';
  message: string;
}

interface ExitData {
  sessionId: string;
  entryTime: string;
  exitTime: string;
  duration: string;
  billingAmount: number;
  billingType: 'HOURLY' | 'DAY_PASS';
  numberPlate: string;
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  slotNumber: string;
  message: string;
}

export default function ParkingManagementPage() {
  const [activeTab, setActiveTab] = useState<'entry' | 'exit'>('entry');
  const [assignmentResult, setAssignmentResult] = useState<AssignmentData | null>(null);
  const [exitResult, setExitResult] = useState<ExitData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssignmentSuccess = (data: AssignmentData) => {
    setAssignmentResult(data);
  };

  const handleNewAssignment = () => {
    setAssignmentResult(null);
  };

  const handleExitSuccess = (data: ExitData) => {
    setExitResult(data);
  };

  const handleNewExit = () => {
    setExitResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Parking Management</h1>
            <p className="text-gray-600 mt-2">
              Manage vehicle entries and exits with automated processing
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => {
                setActiveTab('entry');
                setAssignmentResult(null);
                setExitResult(null);
              }}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'entry'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogIn className="h-4 w-4 mr-2 inline" />
              Vehicle Entry
            </button>
            <button
              onClick={() => {
                setActiveTab('exit');
                setAssignmentResult(null);
                setExitResult(null);
              }}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'exit'
                  ? 'bg-white text-red-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LogOut className="h-4 w-4 mr-2 inline" />
              Vehicle Exit
            </button>
          </div>

          {/* Main Content */}
          {activeTab === 'entry' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Vehicle Entry Form */}
              <div className="lg:col-span-1">
                <VehicleEntryForm
                  onSuccess={handleAssignmentSuccess}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  disabled={!!assignmentResult}
                />
              </div>

              {/* Assignment Result */}
              <div className="lg:col-span-1">
                <AssignmentResult
                  result={assignmentResult}
                  onNewAssignment={handleNewAssignment}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Vehicle Exit Form - takes up 2 columns to accommodate the list */}
              <div className="lg:col-span-2">
                <VehicleExitForm
                  onSuccess={handleExitSuccess}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  disabled={!!exitResult}
                />
              </div>

              {/* Exit Result */}
              <div className="lg:col-span-1">
                <ExitResult
                  result={exitResult}
                  onNewExit={handleNewExit}
                />
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-12">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => window.location.href = '/dashboard'}
                >
                  <div className="text-sm font-medium text-gray-900">Dashboard</div>
                  <div className="text-sm text-gray-500">View parking statistics</div>
                </button>
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => window.location.href = '/maintenance'}
                >
                  <div className="text-sm font-medium text-gray-900">Maintenance</div>
                  <div className="text-sm text-gray-500">Manage slot maintenance</div>
                </button>
                <button 
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                  onClick={() => setActiveTab('exit')}
                >
                  <div className="text-sm font-medium text-gray-900">Vehicle Exit</div>
                  <div className="text-sm text-gray-500">Process vehicle exits</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}