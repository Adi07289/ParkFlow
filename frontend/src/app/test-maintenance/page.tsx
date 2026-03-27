"use client";

import { Button } from '@/components/ui/button';
import { Plus, Upload, RefreshCw } from 'lucide-react';

export default function TestMaintenancePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Slot Management Buttons</h1>
      
      <div className="flex space-x-3 mb-6">
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Add
        </Button>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Slot
        </Button>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <p>If you can see these three buttons above, then the issue is with the maintenance page component logic.</p>
        <p>Visit this test page at: <strong>http://localhost:3001/test-maintenance</strong></p>
      </div>
    </div>
  );
}