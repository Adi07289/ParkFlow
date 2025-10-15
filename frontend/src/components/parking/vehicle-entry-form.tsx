"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SlotSelector, SlotSelectorRef } from './slot-selector';
import { parkingApi } from '@/lib/parking-api';
import { 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  ToggleLeft, 
  ToggleRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface VehicleEntryFormProps {
  onSuccess: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  disabled?: boolean;
}

export function VehicleEntryForm({ onSuccess, isLoading, setIsLoading, disabled = false }: VehicleEntryFormProps) {
  const slotSelectorRef = useRef<SlotSelectorRef>(null);
  const [formData, setFormData] = useState({
    numberPlate: '',
    vehicleType: '' as 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE' | '',
    billingType: 'HOURLY' as 'HOURLY' | 'DAY_PASS',
    slotId: ''
  });
  
  const [assignmentMode, setAssignmentMode] = useState<'auto' | 'manual'>('auto');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const vehicleTypes = [
    { value: 'CAR', label: 'Car', icon: Car, color: 'bg-blue-500' },
    { value: 'BIKE', label: 'Bike', icon: Bike, color: 'bg-green-500' },
    { value: 'EV', label: 'Electric Vehicle', icon: Zap, color: 'bg-yellow-500' },
    { value: 'HANDICAP_ACCESSIBLE', label: 'Handicap Accessible', icon: Accessibility, color: 'bg-purple-500' }
  ];

  const billingTypes = [
    { value: 'HOURLY', label: 'Hourly Billing', description: 'Pay per hour parked' },
    { value: 'DAY_PASS', label: 'Day Pass', description: 'Fixed rate for the day' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numberPlate.trim()) {
      newErrors.numberPlate = 'Number plate is required';
    } else if (!/^[A-Z0-9\-\s]{3,15}$/i.test(formData.numberPlate.trim())) {
      newErrors.numberPlate = 'Invalid number plate format';
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Vehicle type is required';
    }

    if (assignmentMode === 'manual' && !formData.slotId) {
      newErrors.slotId = 'Please select a slot for manual assignment';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setIsLoading(true);
    
    try {
      const requestData = {
        numberPlate: formData.numberPlate.trim().toUpperCase(),
        vehicleType: formData.vehicleType,
        billingType: formData.billingType,
        ...(assignmentMode === 'manual' && formData.slotId ? { slotId: formData.slotId } : {})
      };

      const response = await parkingApi.registerVehicleEntry(requestData);
      
      if (response.success) {
        toast.success(response.message || 'Vehicle entry registered successfully!');
        console.log('Assignment successful, passing data:', {
          ...response.data,
          message: response.message || 'Vehicle entry registered successfully!'
        });
        onSuccess({
          ...response.data,
          message: response.message || 'Vehicle entry registered successfully!'
        });
        
        // Reset form
        setFormData({
          numberPlate: '',
          vehicleType: '',
          billingType: 'HOURLY',
          slotId: ''
        });
        setAssignmentMode('auto');
        
        // Refresh slot availability since a slot was just assigned
        if (slotSelectorRef.current) {
          slotSelectorRef.current.refreshSlots();
        }
      } else {
        toast.error(response.message || 'Failed to register vehicle entry');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to register vehicle entry';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      numberPlate: '',
      vehicleType: '',
      billingType: 'HOURLY',
      slotId: ''
    });
    setAssignmentMode('auto');
    setErrors({});
  };

  const getVehicleTypeIcon = (type: string) => {
    const vehicleType = vehicleTypes.find(vt => vt.value === type);
    return vehicleType ? vehicleType.icon : Car;
  };

  return (
    <Card className={`${disabled ? 'opacity-50' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Car className="h-6 w-6 mr-2 text-blue-600" />
          Vehicle Entry Registration
        </CardTitle>
        <CardDescription>
          Register a new vehicle entry with automatic or manual slot assignment
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Number Plate */}
          <div className="space-y-2">
            <Label htmlFor="numberPlate">Vehicle Number Plate *</Label>
            <Input
              id="numberPlate"
              type="text"
              placeholder="Enter vehicle number plate"
              value={formData.numberPlate}
              onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value })}
              disabled={disabled || isLoading}
              className={errors.numberPlate ? 'border-red-500' : ''}
            />
            {errors.numberPlate && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.numberPlate}
              </div>
            )}
          </div>

          {/* Vehicle Type */}
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value) => setFormData({ ...formData, vehicleType: value as any })}
              disabled={disabled || isLoading}
            >
              <SelectTrigger className={errors.vehicleType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.vehicleType && (
              <div className="flex items-center text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.vehicleType}
              </div>
            )}
          </div>

          {/* Billing Type */}
          <div className="space-y-2">
            <Label>Billing Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {billingTypes.map((billing) => (
                <div
                  key={billing.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.billingType === billing.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !disabled && !isLoading && setFormData({ ...formData, billingType: billing.value as any })}
                >
                  <div className="font-medium text-sm">{billing.label}</div>
                  <div className="text-xs text-gray-500">{billing.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Mode Toggle */}
          <div className="space-y-3">
            <Label>Slot Assignment Mode</Label>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setAssignmentMode(assignmentMode === 'auto' ? 'manual' : 'auto')}
                disabled={disabled || isLoading}
                className="flex items-center space-x-2 text-sm"
              >
                {assignmentMode === 'auto' ? (
                  <ToggleLeft className="h-5 w-5 text-blue-600" />
                ) : (
                  <ToggleRight className="h-5 w-5 text-blue-600" />
                )}
                <span className="font-medium">
                  {assignmentMode === 'auto' ? 'Automatic Assignment' : 'Manual Assignment'}
                </span>
              </button>
              <Badge variant={assignmentMode === 'auto' ? 'default' : 'secondary'}>
                {assignmentMode === 'auto' ? 'Auto' : 'Manual'}
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              {assignmentMode === 'auto' 
                ? 'System will automatically assign the best available slot'
                : 'You can manually select a specific slot'
              }
            </div>
          </div>

          {/* Manual Slot Selection */}
          {assignmentMode === 'manual' && (
            <div className="space-y-2">
              <SlotSelector
                ref={slotSelectorRef}
                vehicleType={formData.vehicleType}
                selectedSlotId={formData.slotId}
                onSlotSelect={(slotId) => setFormData({ ...formData, slotId })}
                disabled={disabled || isLoading}
              />
              {errors.slotId && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.slotId}
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              disabled={disabled || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {assignmentMode === 'auto' ? 'Assigning Slot...' : 'Reserving Slot...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {assignmentMode === 'auto' ? 'Auto Assign Slot' : 'Reserve Selected Slot'}
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={disabled || isLoading}
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}