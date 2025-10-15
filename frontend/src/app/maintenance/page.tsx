"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { Navigation } from '@/components/navigation';
import { slotsApi, Slot, CreateSlotRequest } from '@/lib/slots-api';
import { 
  Plus, 
  Settings, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Search,
  MoreHorizontal,
  RefreshCw,
  Car,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<CreateSlotRequest>({ 
    slotNumber: '', 
    slotType: 'REGULAR' 
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSlots();
    }
  }, [isAuthenticated]);

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      const response = await slotsApi.getSlots();
      setSlots(response.slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      toast.error('Failed to fetch slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    if (!newSlot.slotNumber.trim()) {
      toast.error('Please enter a slot number');
      return;
    }

    try {
      setIsCreating(true);
      await slotsApi.createSlot(newSlot);
      toast.success('Slot created successfully');
      setIsCreateDialogOpen(false);
      setNewSlot({ slotNumber: '', slotType: 'REGULAR' });
      fetchSlots();
    } catch (error) {
      console.error('Failed to create slot:', error);
      toast.error('Failed to create slot');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSetMaintenance = async (slotId: string) => {
    try {
      await slotsApi.setMaintenance(slotId);
      toast.success('Slot marked for maintenance');
      fetchSlots();
    } catch (error) {
      console.error('Failed to set maintenance:', error);
      toast.error('Failed to set maintenance');
    }
  };

  const handleReleaseMaintenance = async (slotId: string) => {
    try {
      await slotsApi.releaseMaintenance(slotId);
      toast.success('Slot released from maintenance');
      fetchSlots();
    } catch (error) {
      console.error('Failed to release maintenance:', error);
      toast.error('Failed to release maintenance');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge variant="success">Available</Badge>;
      case 'OCCUPIED':
        return <Badge variant="warning">Occupied</Badge>;
      case 'MAINTENANCE':
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      REGULAR: 'bg-blue-500 text-white',
      COMPACT: 'bg-green-500 text-white',
      EV: 'bg-yellow-500 text-white',
      HANDICAP_ACCESSIBLE: 'bg-purple-500 text-white',
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-500 text-white'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const filteredSlots = slots.filter(slot => {
    const matchesSearch = slot.slotNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || slot.status === selectedStatus;
    const matchesType = selectedType === 'all' || slot.slotType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'AVAILABLE').length,
    occupied: slots.filter(s => s.status === 'OCCUPIED').length,
    maintenance: slots.filter(s => s.status === 'MAINTENANCE').length,
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Slot Maintenance</h1>
              <p className="text-gray-600 mt-1">Manage parking slots and maintenance status</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={fetchSlots} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Slot
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Slot</DialogTitle>
                    <DialogDescription>
                      Add a new parking slot to the system.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Slot Number
                      </label>
                      <Input
                        placeholder="e.g., B1-12"
                        value={newSlot.slotNumber}
                        onChange={(e) => setNewSlot(prev => ({ ...prev, slotNumber: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Slot Type
                      </label>
                      <Select
                        value={newSlot.slotType}
                        onChange={(e) => setNewSlot(prev => ({ 
                          ...prev, 
                          slotType: e.target.value as any 
                        }))}
                      >
                        <option value="REGULAR">Regular</option>
                        <option value="COMPACT">Compact</option>
                        <option value="EV">EV Charging</option>
                        <option value="HANDICAP_ACCESSIBLE">Handicap Accessible</option>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSlot} disabled={isCreating}>
                      {isCreating ? 'Creating...' : 'Create Slot'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.available}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupied</CardTitle>
                <Car className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.occupied}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
                <Wrench className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.maintenance}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Search and filter parking slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Search Slots
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by slot number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Type
                  </label>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="REGULAR">Regular</option>
                    <option value="COMPACT">Compact</option>
                    <option value="EV">EV Charging</option>
                    <option value="HANDICAP_ACCESSIBLE">Handicap Accessible</option>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slots Table */}
          <Card>
            <CardHeader>
              <CardTitle>Slots ({filteredSlots.length})</CardTitle>
              <CardDescription>
                Manage parking slots and their maintenance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Slot Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSlots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.slotNumber}</TableCell>
                      <TableCell>{getTypeBadge(slot.slotType)}</TableCell>
                      <TableCell>{getStatusBadge(slot.status)}</TableCell>
                      <TableCell>
                        {new Date(slot.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {slot.status === 'MAINTENANCE' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReleaseMaintenance(slot.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Release
                            </Button>
                          ) : slot.status === 'AVAILABLE' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetMaintenance(slot.id)}
                            >
                              <Wrench className="h-4 w-4 mr-1" />
                              Maintain
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              <XCircle className="h-4 w-4 mr-1" />
                              Occupied
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSlots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="text-gray-500">
                          {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' 
                            ? 'No slots found matching your filters' 
                            : 'No slots available. Create your first slot to get started.'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}