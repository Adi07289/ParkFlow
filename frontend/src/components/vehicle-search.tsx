"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parkingApi, VehicleSearchResponse, QuickSearchResult } from '@/lib/parking-api';
import { Search, MapPin, Clock, IndianRupee, Car, Bike, Zap, Accessibility } from 'lucide-react';
import { toast } from 'sonner';
import { formatToISTDateTime } from '@/lib/time-utils';

interface VehicleSearchProps {
  onVehicleFound?: (vehicle: VehicleSearchResponse) => void;
}

export function VehicleSearch({ onVehicleFound }: VehicleSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<VehicleSearchResponse | null>(null);
  const [quickResults, setQuickResults] = useState<QuickSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showQuickResults, setShowQuickResults] = useState(false);

  // Quick search for autocomplete
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchTerm.length > 2) {
        try {
          const results = await parkingApi.quickSearch(searchTerm);
          setQuickResults(results);
          setShowQuickResults(true);
        } catch (error) {
          setQuickResults([]);
        }
      } else {
        setQuickResults([]);
        setShowQuickResults(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = async (numberPlate?: string) => {
    const searchValue = numberPlate || searchTerm;
    if (!searchValue.trim()) {
      toast.error('Please enter a number plate');
      return;
    }

    setIsSearching(true);
    setShowQuickResults(false);

    try {
      const result = await parkingApi.searchVehicle(searchValue);
      setSearchResult(result);
      onVehicleFound?.(result);
      toast.success('Vehicle found');
    } catch (error: any) {
      console.error('Search failed:', error);
      setSearchResult(null);
      if (error.response?.status === 404) {
        toast.error('Vehicle not found');
      } else {
        toast.error('Search failed. Please try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickResultClick = (result: QuickSearchResult) => {
    setSearchTerm(result.numberPlate);
    setShowQuickResults(false);
    handleSearch(result.numberPlate);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
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

  const getVehicleTypeBadge = (type: string) => {
    const colors = {
      CAR: 'bg-blue-500 text-white',
      BIKE: 'bg-green-500 text-white',
      EV: 'bg-yellow-500 text-white',
      HANDICAP_ACCESSIBLE: 'bg-purple-500 text-white',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-500 text-white'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const isActive = status.toLowerCase() === 'active';
    return (
      <Badge variant={isActive ? 'success' : 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="mr-2 h-5 w-5" />
            Vehicle Search
          </CardTitle>
          <CardDescription>
            Search by number plate to locate a vehicle in the parking system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Enter number plate (e.g., ABC-1234)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Button onClick={() => handleSearch()} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Quick Search Results */}
            {showQuickResults && quickResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                {quickResults.map((result) => {
                  const Icon = getVehicleIcon(result.vehicleType);
                  return (
                    <div
                      key={result.vehicleId}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleQuickResultClick(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="font-medium">{result.numberPlate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getVehicleTypeBadge(result.vehicleType)}
                          <Badge variant="outline">{result.slotNumber}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Vehicle Details
              </div>
              {searchResult.currentSession && (
                <Badge variant="success">Currently Parked</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Vehicle Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {(() => {
                    const Icon = getVehicleIcon(searchResult.vehicle.vehicleType);
                    return <Icon className="h-6 w-6 mr-3 text-gray-600" />;
                  })()}
                  <div>
                    <div className="font-bold text-lg">{searchResult.vehicle.numberPlate}</div>
                    <div className="text-sm text-gray-600">Vehicle ID: {searchResult.vehicle.id}</div>
                  </div>
                </div>
                {getVehicleTypeBadge(searchResult.vehicle.vehicleType)}
              </div>

              {/* Current Session */}
              {searchResult.currentSession && (
                <div>
                  <h4 className="font-semibold mb-3">Current Parking Session</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                      <div>
                        <div className="text-sm text-blue-900">Slot</div>
                        <div className="font-medium text-blue-800">{searchResult.currentSession.slotNumber}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <Clock className="h-5 w-5 mr-2 text-green-600" />
                      <div>
                        <div className="text-sm text-green-900">Duration</div>
                        <div className="font-medium text-green-800">
                          {formatDuration(searchResult.currentSession.entryTime)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <IndianRupee className="h-5 w-5 mr-2 text-purple-600" />
                      <div>
                        <div className="text-sm text-purple-900">Billing</div>
                        <div className="font-medium text-purple-800">{searchResult.currentSession.billingType}</div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="font-medium">{getStatusBadge(searchResult.currentSession.status)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Entry Time: {formatToISTDateTime(searchResult.currentSession.entryTime).full} IST
                  </div>
                </div>
              )}

              {/* Parking History */}
              {searchResult.parkingHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Parking History</h4>
                  <div className="space-y-2">
                    {searchResult.parkingHistory.slice(0, 5).map((history) => (
                      <div key={history.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">{history.slotNumber}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{history.duration}</span>
                          <span>${history.billingAmount}</span>
                          <span>{formatToISTDateTime(history.entryTime).date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}