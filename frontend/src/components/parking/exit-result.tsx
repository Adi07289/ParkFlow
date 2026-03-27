"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatToISTDateTime } from '@/lib/time-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  LogOut, 
  Clock, 
  Car, 
  IndianRupee,
  Plus,
  FileText,
  Printer,
  MapPin,
  Calendar
} from 'lucide-react';

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

interface ExitResultProps {
  result: ExitData | null;
  onNewExit: () => void;
}

export function ExitResult({ result, onNewExit }: ExitResultProps) {
  const getVehicleIcon = (vehicleType?: string) => {
    switch (vehicleType) {
      case 'CAR':
      case 'BIKE':
      case 'EV':
      case 'HANDICAP_ACCESSIBLE':
        return Car;
      default:
        return Car;
    }
  };

  const getBillingTypeBadge = (billingType: string) => {
    return (
      <Badge variant={billingType === 'HOURLY' ? 'default' : 'secondary'}>
        {billingType === 'HOURLY' ? 'Hourly Billing' : 'Day Pass'}
      </Badge>
    );
  };

  const formatDateTime = (dateTime: string) => {
    return formatToISTDateTime(dateTime);
  };

  const calculateSavings = () => {
    if (!result) return null;
    
    // Simple savings calculation (this could be enhanced)
    const hourlyRate = 10; // Assuming ₹10/hour
    const dayPassRate = 50; // Assuming ₹50/day
    
    if (result.billingType === 'HOURLY') {
      const dayPassCost = dayPassRate;
      const actualCost = result.billingAmount;
      const savings = dayPassCost - actualCost;
      return savings > 0 ? savings : 0;
    }
    
    return 0;
  };

  const handlePrintReceipt = () => {
    if (!result) return;
    
    const entryDateTime = formatDateTime(result.entryTime);
    const exitDateTime = formatDateTime(result.exitTime);
    const savings = calculateSavings();
    
    const receiptContent = `
      PARKING EXIT RECEIPT
      ==================
      
      Session ID: ${result.sessionId}
      Vehicle: ${result.numberPlate} (${result.vehicleType})
      Slot: ${result.slotNumber}
      
      TIMING:
      Entry: ${entryDateTime.date} at ${entryDateTime.time}
      Exit:  ${exitDateTime.date} at ${exitDateTime.time}
      Duration: ${result.duration}
      
      BILLING:
      Type: ${result.billingType}
      Amount: ₹${result.billingAmount}
      ${savings > 0 ? `Savings vs Day Pass: ₹${savings}` : ''}
      
      STATUS: PAYMENT COMPLETED
      
      ==================
      Thank you for parking with us!
      
      Questions? Contact support.
    `;
    
    // For demo purposes, show alert. In production, implement proper printing
    alert('Printing receipt...\n\n' + receiptContent);
  };

  if (!result) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <LogOut className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-2">Exit Processing</p>
          <p className="text-sm text-gray-400">
            Process a vehicle exit to see the results and receipt here
          </p>
        </CardContent>
      </Card>
    );
  }

  const entryDateTime = formatDateTime(result.entryTime);
  const exitDateTime = formatDateTime(result.exitTime);
  const savings = calculateSavings();

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <CheckCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-green-800">Exit Processed Successfully!</CardTitle>
            <CardDescription className="text-green-600">
              {result.message}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Vehicle & Session Details */}
        <div className="bg-white rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-800 mb-3">Session Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Car className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Vehicle</div>
                <div className="font-semibold text-lg">{result.numberPlate}</div>
                <div className="text-sm text-gray-400">{result.vehicleType.replace('_', ' ')}</div>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Slot</div>
                <div className="font-semibold text-lg">#{result.slotNumber}</div>
                <div className="text-sm text-gray-400">Now available</div>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Total Duration</div>
                <div className="font-semibold text-lg">{result.duration}</div>
                <div className="text-sm text-gray-400">Parking time</div>
              </div>
            </div>

            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Session ID</div>
                <div className="font-mono text-sm">{result.sessionId.slice(0, 8)}...</div>
                <div className="text-sm text-gray-400">Reference</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timing Details */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Timing Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Entry Time</div>
                <div className="font-medium">{entryDateTime.time}</div>
                <div className="text-sm text-gray-400">{entryDateTime.date}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Exit Time</div>
                <div className="font-medium">{exitDateTime.time}</div>
                <div className="text-sm text-gray-400">{exitDateTime.date}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="bg-white rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Billing Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Billing Type:</span>
              <div>{getBillingTypeBadge(result.billingType)}</div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Parking Duration:</span>
              <span className="font-medium">{result.duration}</span>
            </div>
            
            {savings > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>Savings vs Day Pass:</span>
                <span className="font-medium">₹{savings}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <div className="flex justify-between items-center text-lg">
                <span className="font-semibold">Total Amount:</span>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-green-600 mr-1" />
                  <span className="font-bold text-green-600">₹{result.billingAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Payment Status</h3>
              <p className="text-sm text-gray-500">Payment processed successfully</p>
            </div>
            <Badge className="bg-green-500 text-white">
              PAID
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
                // Navigate to dashboard to view updated stats
                window.location.href = '/dashboard';
              }}
              variant="outline"
              className="flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View Dashboard
            </Button>
          </div>

          <Button
            onClick={onNewExit}
            className="w-full flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Process Another Exit
          </Button>
        </div>

        {/* Receipt Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Receipt Summary:</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Vehicle {result.numberPlate} exited successfully</div>
            <div>• Slot #{result.slotNumber} is now available</div>
            <div>• Payment of ₹{result.billingAmount} processed</div>
            <div>• Receipt available for printing</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}