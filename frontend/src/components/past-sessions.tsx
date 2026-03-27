"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { formatToISTDateTime } from '@/lib/time-utils';
import { 
  Car, 
  Bike, 
  Zap, 
  Accessibility, 
  Clock, 
  MapPin, 
  IndianRupee,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface PastSession {
  sessionId: string;
  vehicle: {
    numberPlate: string;
    vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  };
  slot: {
    number: string;
    type: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
  };
  entryTime: string;
  exitTime: string;
  duration: string;
  billingAmount: number;
  billingType: 'HOURLY' | 'DAY_PASS';
}

interface PastSessionsProps {
  refreshTrigger?: number;
}

export function PastSessions({ refreshTrigger }: PastSessionsProps) {
  const [sessions, setSessions] = useState<PastSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [selectedBillingType, setSelectedBillingType] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchPastSessions();
  }, [refreshTrigger, pagination.page, selectedVehicleType, selectedBillingType, startDate, endDate]);

  const fetchPastSessions = async () => {
    try {
      setIsLoading(true);
      const response = await parkingApi.getParkingHistory({
        page: pagination.page,
        limit: pagination.limit,
        vehicleType: selectedVehicleType !== 'all' ? selectedVehicleType as any : undefined,
        startDate,
        endDate
      });
      
      setSessions(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch past sessions:', error);
      toast.error('Failed to load past sessions');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchTerm === '' || 
      session.vehicle.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.slot.number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBillingType = selectedBillingType === 'all' || 
      session.billingType === selectedBillingType;
    
    return matchesSearch && matchesBillingType;
  });

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

  const getBillingTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'HOURLY' ? 'default' : 'secondary'}>
        {type === 'HOURLY' ? 'Hourly' : 'Day Pass'}
      </Badge>
    );
  };

  const getSlotTypeBadge = (type: string) => {
    const colors = {
      REGULAR: 'bg-blue-100 text-blue-800',
      COMPACT: 'bg-green-100 text-green-800',
      EV: 'bg-yellow-100 text-yellow-800',
      HANDICAP_ACCESSIBLE: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedVehicleType('all');
    setSelectedBillingType('all');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const totalRevenue = filteredSessions.reduce((sum, session) => sum + session.billingAmount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">{filteredSessions.length}</div>
                <div className="text-sm text-gray-600">Total Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <IndianRupee className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">₹{totalRevenue}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {filteredSessions.filter(s => s.billingType === 'HOURLY').length}
                </div>
                <div className="text-sm text-gray-600">Hourly Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {filteredSessions.filter(s => s.billingType === 'DAY_PASS').length}
                </div>
                <div className="text-sm text-gray-600">Day Pass Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Past Sessions Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Past Sessions</CardTitle>
              <CardDescription>
                {filteredSessions.length} completed session{filteredSessions.length !== 1 ? 's' : ''}
                {pagination.total > 0 && ` (${pagination.total} total)`}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchPastSessions}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by plate or slot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
              <SelectTrigger>
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

            <Select value={selectedBillingType} onValueChange={setSelectedBillingType}>
              <SelectTrigger>
                <SelectValue placeholder="Billing Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing</SelectItem>
                <SelectItem value="HOURLY">Hourly</SelectItem>
                <SelectItem value="DAY_PASS">Day Pass</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No completed sessions found
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => {
                    const Icon = getVehicleIcon(session.vehicle.vehicleType);
                    return (
                      <TableRow key={session.sessionId}>
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
                              <div className="font-medium">{session.slot.number}</div>
                              <div className="text-sm">
                                {getSlotTypeBadge(session.slot.type)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="font-medium">{session.duration}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatToISTDateTime(session.entryTime).full}</div>
                            <div className="text-xs text-gray-400">IST</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatToISTDateTime(session.exitTime).full}</div>
                            <div className="text-xs text-gray-400">IST</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getBillingTypeBadge(session.billingType)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center font-medium text-green-600">
                            <span className="text-green-600 mr-1">₹</span>
                            {session.billingAmount}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total sessions)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}