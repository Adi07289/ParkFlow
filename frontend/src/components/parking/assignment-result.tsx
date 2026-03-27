"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatToISTDateTime } from '@/lib/time-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  IndianRupee,
  Plus,
  FileText,
  Printer
} from 'lucide-react';

interface AssignmentData {
  sessionId: string;
  vehicleId: string;
  slotId: string;
  slotNumber: string;
  entryTime: string;
  billingType: 'HOURLY' | 'DAY_PASS';
  message: string;
}

interface AssignmentResultProps {
  result: AssignmentData | null;
  onNewAssignment: () => void;
}

export function AssignmentResult({ result, onNewAssignment }: AssignmentResultProps) {
  console.log('AssignmentResult received result:', result);
  const getVehicleIcon = (vehicleType?: string) => {
    switch (vehicleType) {
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

  const getBillingTypeBadge = (billingType: string) => {
    return (
      <Badge variant={billingType === 'HOURLY' ? 'default' : 'secondary'}>
        {billingType === 'HOURLY' ? 'Hourly' : 'Day Pass'}
      </Badge>
    );
  };

  const formatEntryTime = (entryTime: string) => {
    return formatToISTDateTime(entryTime);
  };

  const handlePrintReceipt = () => {
    if (!result) return;
    
    const entryDateTime = formatEntryTime(result.entryTime);
    
    // Create a simple receipt format
    const receiptContent = `
      PARKING RECEIPT
      ================
      
      Session ID: ${result.sessionId}
      Slot Number: ${result.slotNumber}
      Entry Date: ${entryDateTime.date}
      Entry Time: ${entryDateTime.time}
      Billing Type: ${result.billingType}
      
      Status: ACTIVE PARKING SESSION
      
      ================
      Thank you for parking with us!
    `;
    
    // For demo purposes, just show an alert
    // In a real application, you'd implement proper printing
    alert('Printing receipt...\n\n' + receiptContent);
  };

  if (!result) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-2">Assignment Result</p>
          <p className="text-sm text-gray-400">
            Complete the vehicle entry form to see the assignment result here
          </p>
        </CardContent>
      </Card>
    );
  }

  const entryDateTime = formatEntryTime(result.entryTime);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-green-800">Assignment Successful!</CardTitle>
            <CardDescription className="text-green-600">
              {result.message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Assignment Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-3">Assignment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Assigned Slot</div>
                <div className="font-semibold text-lg">#{result.slotNumber}</div>
              </div>
            </div>

            <div className="flex items-center">
              <IndianRupee className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Billing Type</div>
                <div>{getBillingTypeBadge(result.billingType)}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Entry Time</div>
                <div className="font-medium">{entryDateTime.time}</div>
                <div className="text-sm text-gray-400">{entryDateTime.date}</div>
              </div>
            </div>

            <div className="flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Session ID</div>
                <div className="font-mono text-sm">{result.sessionId.slice(0, 8)}...</div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Status */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Session Status</h3>
              <p className="text-sm text-gray-500">Parking session is now active</p>
            </div>
            <Badge className="bg-green-500 text-white">
              ACTIVE
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={handlePrintReceipt}
              variant="outline"
              className="flex items-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            
            <Button
              onClick={() => {
                // Navigate to dashboard to view current sessions
                window.location.href = '/dashboard';
              }}
              variant="outline"
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View in Dashboard
            </Button>
          </div>

          <Button
            onClick={onNewAssignment}
            className="w-full flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Register Another Vehicle
          </Button>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Keep your receipt for exit processing</li>
            <li>• {result.billingType === 'HOURLY' ? 'Billing starts immediately at hourly rates' : 'Day pass valid until end of day'}</li>
            <li>• Vehicle exit can be processed at any time</li>
            <li>• Contact support if you need assistance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}