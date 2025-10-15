"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { parkingApi } from '@/lib/parking-api';
import { formatToISTDateTime, formatToISTTimeOnly } from '@/lib/time-utils';
import { 
  Car, 
  Bike,
  Zap,
  Accessibility,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Clock,
  IndianRupee,
  MapPin,
  RefreshCw,
  Filter,
  Users,
  Calendar,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface VehicleExitFormProps {
  onSuccess: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  disabled?: boolean;
}

interface ActiveSession {
  sessionId: string;
  vehicle: {
    numberPlate: string;
    vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  };
  slot: {
    number: string;
    type: string;
  };
  entryTime: string;
  duration: string;
  billingType: 'HOURLY' | 'DAY_PASS';
}

export function VehicleExitForm({ onSuccess, isLoading, setIsLoading, disabled = false }: VehicleExitFormProps) {
  const [numberPlate, setNumberPlate] = useState('');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allSessions, setAllSessions] = useState<ActiveSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ActiveSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [showVehicleList, setShowVehicleList] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load all current sessions on component mount
  useEffect(() => {
    fetchAllSessions();
  }, []);

  // Filter sessions based on search and vehicle type
  useEffect(() => {
    let filtered = allSessions;

    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      filtered = filtered.filter(session => 
        session.vehicle.numberPlate.toLowerCase().includes(query) ||
        session.slot.number.toLowerCase().includes(query)
      );
    }

    if (vehicleTypeFilter !== 'all') {
      filtered = filtered.filter(session => 
        session.vehicle.vehicleType === vehicleTypeFilter
      );
    }

    setFilteredSessions(filtered);
  }, [allSessions, searchFilter, vehicleTypeFilter]);

  const fetchAllSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await parkingApi.getCurrentlyParkedVehicles();
      setAllSessions(response.vehicles || []);
    } catch (error) {
      console.error('Failed to fetch current sessions:', error);
      toast.error('Failed to load parked vehicles');
      setAllSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!numberPlate.trim()) {
      newErrors.numberPlate = 'Number plate is required';
    } else if (!/^[A-Z0-9\-\s]{3,15}$/i.test(numberPlate.trim())) {
      newErrors.numberPlate = 'Invalid number plate format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const searchVehicle = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSearching(true);
    setActiveSession(null);
    
    try {
      const plateToSearch = numberPlate.trim().toUpperCase();
      
      // Get current parking sessions and find the one for this vehicle
      const currentSessions = await parkingApi.getCurrentlyParkedVehicles();
      const vehicleSession = currentSessions.vehicles.find(
        session => session.vehicle.numberPlate.toUpperCase() === plateToSearch
      );

      if (vehicleSession) {
        setActiveSession(vehicleSession);
        toast.success('Vehicle found! Ready to process exit.');
      } else {
        toast.error('No active parking session found for this vehicle');
        setActiveSession(null);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to search for vehicle';
      toast.error(errorMessage);
      setActiveSession(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleExit = async () => {
    if (!activeSession) return;

    setIsLoading(true);
    
    try {
      const response = await parkingApi.registerVehicleExit(activeSession.vehicle.numberPlate);
      
      if (response.success) {
        toast.success('Vehicle exit processed successfully!');
        onSuccess({
          ...response.data,
          numberPlate: activeSession.vehicle.numberPlate,
          vehicleType: activeSession.vehicle.vehicleType,
          slotNumber: activeSession.slot.number,
          message: response.message || 'Vehicle exit processed successfully!'
        });
        
        // Reset form
        setNumberPlate('');
        setActiveSession(null);
        setErrors({});
        
        // Focus back to search input
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else {
        toast.error(response.message || 'Failed to process vehicle exit');
      }
    } catch (error: any) {
      console.error('Exit error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process vehicle exit';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const selectVehicleFromList = (session: ActiveSession) => {
    setActiveSession(session);
    setNumberPlate(session.vehicle.numberPlate);
    setShowVehicleList(false);
    toast.success('Vehicle selected! Ready to process exit.');
  };

  const handleReset = () => {
    setNumberPlate('');
    setActiveSession(null);
    setErrors({});
    setShowVehicleList(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const calculateEstimatedBilling = (session: ActiveSession) => {
    // Simple billing estimation (this should match backend logic)
    const entryTime = new Date(session.entryTime);
    const now = new Date();
    const durationMs = now.getTime() - entryTime.getTime();
    const hours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to next hour
    
    if (session.billingType === 'HOURLY') {
      return hours * 10; // ₹10 per hour
    } else {
      return 50; // Day pass rate
    }
  };

  const formatParkingDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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

  const getBillingTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'HOURLY' ? 'default' : 'secondary'}>
        {type === 'HOURLY' ? 'Hourly' : 'Day Pass'}
      </Badge>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching && !isLoading) {
      e.preventDefault();
      if (!activeSession) {
        searchVehicle();
      } else {
        handleExit();
      }
    }
  };

  const getVehicleTypeIcon = (type: string) => {
    switch (type) {
      case 'CAR': return Car;
      case 'BIKE': return Bike;
      case 'EV': return Zap;
      case 'HANDICAP_ACCESSIBLE': return Accessibility;
      default: return Car;
    }
  };

  const formatEntryTime = (entryTime: string) => {
    return formatToISTDateTime(entryTime);
  };

  return (
    <div className="space-y-6">
      {/* Main Exit Processing Card */}
      <Card className={`${disabled ? 'opacity-50' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <LogOut className="h-6 w-6 mr-2 text-red-600" />
              Vehicle Exit Processing
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVehicleList(!showVehicleList)}
              >
                <Users className="h-4 w-4 mr-1" />
                {showVehicleList ? 'Hide' : 'Show'} Vehicle List
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllSessions}
                disabled={isLoadingSessions}
              >
                {isLoadingSessions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Process vehicle exit and calculate parking charges. Select from the list below or search manually.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {/* Manual Search Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numberPlate">Search by Number Plate or Slot *</Label>
                <div className="flex space-x-2">
                  <Input
                    ref={searchInputRef}
                    id="numberPlate"
                    type="text"
                    placeholder="Enter vehicle number plate or slot number"
                    value={numberPlate}
                    onChange={(e) => setNumberPlate(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={disabled || isLoading || isSearching}
                    className={errors.numberPlate ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    onClick={searchVehicle}
                    disabled={disabled || isLoading || isSearching || !numberPlate.trim()}
                    variant="outline"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.numberPlate && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.numberPlate}
                  </div>
                )}
              </div>
            </div>

          {/* Active Session Display */}
          {activeSession && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-3">Active Parking Session</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Car className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Vehicle</div>
                      <div className="font-semibold">{activeSession.vehicle.numberPlate}</div>
                      <div className="text-sm text-gray-500">{activeSession.vehicle.vehicleType}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Slot</div>
                      <div className="font-semibold">#{activeSession.slot.number}</div>
                      <div className="text-sm text-gray-500">{activeSession.slot.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-orange-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Parking Duration</div>
                      <div className="font-semibold">{activeSession.duration}</div>
                      <div className="text-sm text-gray-500">
                        Since {formatEntryTime(activeSession.entryTime).time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <IndianRupee className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <div className="text-sm text-gray-500">Billing Type</div>
                      <div className="font-semibold">
                        {activeSession.billingType === 'HOURLY' ? 'Hourly' : 'Day Pass'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Entry: {formatEntryTime(activeSession.entryTime).date}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exit Actions */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleExit}
                  disabled={disabled || isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Exit...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4 mr-2" />
                      Process Vehicle Exit
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={disabled || isLoading}
                  className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">How to Process Exit:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Select a vehicle from the list below or search manually</li>
              <li>2. Review the parking details and estimated billing</li>
              <li>3. Click "Process Vehicle Exit" to complete the exit</li>
              <li>4. Payment will be calculated and receipt generated</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Currently Parked Vehicles List */}
    {showVehicleList && (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                Currently Parked Vehicles
              </CardTitle>
              <CardDescription>
                {filteredSessions.length} of {allSessions.length} vehicles shown
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllSessions}
                disabled={isLoadingSessions}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by number plate or slot..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CAR">Cars</SelectItem>
                  <SelectItem value="BIKE">Bikes</SelectItem>
                  <SelectItem value="EV">EVs</SelectItem>
                  <SelectItem value="HANDICAP_ACCESSIBLE">Accessible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vehicle List Table */}
          {isLoadingSessions ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-500">Loading parked vehicles...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {allSessions.length === 0 ? (
                <>
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No vehicles currently parked</p>
                  <p className="text-sm">All parking slots are available</p>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No vehicles match your search</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Est. Amount</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const Icon = getVehicleTypeIcon(session.vehicle.vehicleType);
                    const estimatedAmount = calculateEstimatedBilling(session);
                    const duration = formatParkingDuration(session.entryTime);
                    const entryTime = formatEntryTime(session.entryTime);
                    
                    return (
                      <TableRow 
                        key={session.sessionId} 
                        className={`cursor-pointer hover:bg-gray-50 ${
                          activeSession?.sessionId === session.sessionId ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => selectVehicleFromList(session)}
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <Icon className="h-5 w-5 mr-2 text-gray-600" />
                            <div>
                              <div className="font-medium">{session.vehicle.numberPlate}</div>
                              <div className="text-sm">
                                {getVehicleTypeBadge(session.vehicle.vehicleType)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                            <div>
                              <div className="font-medium">#{session.slot.number}</div>
                              <div className="text-sm text-gray-500">{session.slot.type}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <div>
                              <div className="font-medium">{duration}</div>
                              <div className="text-sm text-gray-500">Parked</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1 text-gray-400" />
                            {getBillingTypeBadge(session.billingType)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <IndianRupee className="h-4 w-4 mr-1 text-green-600" />
                            <span className="font-semibold text-green-600">₹{estimatedAmount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{entryTime.time}</div>
                            <div className="text-gray-500">{entryTime.date}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectVehicleFromList(session);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Exit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Quick Stats */}
          {allSessions.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{allSessions.length}</div>
                <div className="text-sm text-gray-500">Total Parked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {allSessions.filter(s => s.billingType === 'HOURLY').length}
                </div>
                <div className="text-sm text-gray-500">Hourly</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {allSessions.filter(s => s.billingType === 'DAY_PASS').length}
                </div>
                <div className="text-sm text-gray-500">Day Pass</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${allSessions.reduce((total, session) => total + calculateEstimatedBilling(session), 0)}
                </div>
                <div className="text-sm text-gray-500">Est. Revenue</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )}
  </div>
);
}