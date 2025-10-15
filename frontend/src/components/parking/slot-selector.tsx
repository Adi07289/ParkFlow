"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { slotsApi } from '@/lib/slots-api';
import { formatToISTTimeOnly } from '@/lib/time-utils';
import { 
  MapPin, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Car,
  Bike,
  Zap,
  Accessibility
} from 'lucide-react';

interface Slot {
  id: string;
  slotNumber: string;
  slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface SlotSelectorProps {
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE' | '';
  selectedSlotId: string;
  onSlotSelect: (slotId: string) => void;
  disabled?: boolean;
}

export interface SlotSelectorRef {
  refreshSlots: () => void;  
}

export const SlotSelector = forwardRef<SlotSelectorRef, SlotSelectorProps>(({ vehicleType, selectedSlotId, onSlotSelect, disabled = false }, ref) => {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [groupedSlots, setGroupedSlots] = useState<Record<string, Slot[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAvailableSlots = async () => {
    if (!vehicleType) {
      setAvailableSlots([]);
      setGroupedSlots({});
      setTotalAvailable(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await slotsApi.getAvailableSlots(vehicleType);
      
      if (response.success && response.data) {
        setAvailableSlots(response.data.slots);
        setGroupedSlots(response.data.groupedByType);
        setTotalAvailable(response.data.totalAvailable);
        setLastUpdated(new Date());
      } else {
        setAvailableSlots([]);
        setGroupedSlots({});
        setTotalAvailable(0);
      }
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots([]);
      setGroupedSlots({});
      setTotalAvailable(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableSlots();
  }, [vehicleType]); // This is needed to update slots when vehicle type changes

  useImperativeHandle(ref, () => ({
    refreshSlots: fetchAvailableSlots
  }));

  const getSlotTypeIcon = (slotType: string) => {
    switch (slotType) {
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

  const getSlotTypeColor = (slotType: string) => {
    switch (slotType) {
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

  const getSlotTypeLabel = (slotType: string) => {
    switch (slotType) {
      case 'REGULAR':
        return 'Regular';
      case 'COMPACT':
        return 'Compact';
      case 'EV':
        return 'EV Charging';
      case 'HANDICAP_ACCESSIBLE':
        return 'Handicap Accessible';
      default:
        return slotType;
    }
  };

  const selectedSlot = availableSlots.find(slot => slot.id === selectedSlotId);

  if (!vehicleType) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Select a vehicle type first to view available slots</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            Available Slots
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {totalAvailable} available
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAvailableSlots}
              disabled={disabled || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {formatToISTTimeOnly(lastUpdated)} IST
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-gray-500">Loading available slots...</p>
          </div>
        ) : totalAvailable === 0 ? (
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-orange-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">No available slots</p>
            <p className="text-sm text-gray-500">
              No compatible slots available for {vehicleType.replace('_', ' ').toLowerCase()} vehicles
            </p>
          </div>
        ) : (
          <>
            {/* Slot Selection Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="slot-select">Select Slot *</Label>
              <Select
                value={selectedSlotId}
                onValueChange={onSlotSelect}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a slot" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(groupedSlots).map(([slotType, slots]) => {
                    const Icon = getSlotTypeIcon(slotType);
                    return (
                      <div key={slotType}>
                        <div className="px-2 py-1.5 text-sm font-medium text-gray-900 bg-gray-50">
                          <div className="flex items-center">
                            <Icon className="h-4 w-4 mr-2" />
                            {getSlotTypeLabel(slotType)} ({slots.length})
                          </div>
                        </div>
                        {slots.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>Slot {slot.slotNumber}</span>
                              <Badge 
                                className={`ml-2 ${getSlotTypeColor(slot.slotType)} text-white text-xs`}
                              >
                                {getSlotTypeLabel(slot.slotType)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Slot Info */}
            {selectedSlot && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">
                    Selected: Slot {selectedSlot.slotNumber}
                  </span>
                  <Badge 
                    className={`ml-2 ${getSlotTypeColor(selectedSlot.slotType)} text-white`}
                  >
                    {getSlotTypeLabel(selectedSlot.slotType)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Slot Type Summary */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(groupedSlots).map(([slotType, slots]) => {
                const Icon = getSlotTypeIcon(slotType);
                return (
                  <div 
                    key={slotType}
                    className="p-2 border border-gray-200 rounded-lg text-center"
                  >
                    <Icon className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm font-medium">{slots.length}</div>
                    <div className="text-xs text-gray-500">
                      {getSlotTypeLabel(slotType)}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});