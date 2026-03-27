"use client";

import { useEffect, useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Navigation } from '@/components/navigation';
import { slotsApi, Slot, CreateSlotRequest } from '@/lib/slots-api';
import { 
  Plus, 
  Settings, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Search,
  RefreshCw,
  Car,
  MapPin,
  Trash2,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';

export default function WorkingMaintenancePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkCreateDialogOpen, setIsBulkCreateDialogOpen] = useState(false);
  const [newSlot, setNewSlot] = useState<CreateSlotRequest>({ 
    slotNumber: '', 
    slotType: 'REGULAR' 
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [bulkSlots, setBulkSlots] = useState('');
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      const response = await slotsApi.getSlots();
      setSlots(response.slots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setSlots([]);
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

  const handleBulkCreateSlots = async () => {
    if (!bulkSlots.trim()) {
      toast.error('Please enter slot data');
      return;
    }

    try {
      setIsBulkCreating(true);
      
      const lines = bulkSlots.trim().split('\n');
      const slotsToCreate: CreateSlotRequest[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [slotNumber, slotType] = line.split(',').map(item => item.trim());
        
        if (!slotNumber) {
          toast.error(`Line ${i + 1}: Slot number is required`);
          return;
        }
        
        const validSlotType = slotType?.toUpperCase() as 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
        if (!['REGULAR', 'COMPACT', 'EV', 'HANDICAP_ACCESSIBLE'].includes(validSlotType)) {
          toast.error(`Line ${i + 1}: Invalid slot type. Use REGULAR, COMPACT, EV, or HANDICAP_ACCESSIBLE`);
          return;
        }
        
        slotsToCreate.push({
          slotNumber,
          slotType: validSlotType
        });
      }
      
      if (slotsToCreate.length === 0) {
        toast.error('No valid slots to create');
        return;
      }
      
      await slotsApi.bulkCreateSlots(slotsToCreate);
      toast.success(`Successfully created ${slotsToCreate.length} slots`);
      setIsBulkCreateDialogOpen(false);
      setBulkSlots('');
      fetchSlots();
    } catch (error) {
      console.error('Failed to bulk create slots:', error);
      toast.error('Failed to create slots');
    } finally {
      setIsBulkCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      setIsDeleting(true);
      const result = await slotsApi.deleteSlot(slotId);
      
      if (result.success) {
        toast.success(result.message || 'Slot deleted successfully');
        fetchSlots();
      } else {
        toast.error(result.message || 'Failed to delete slot');
      }
      setDeleteSlotId(null);
    } catch (error: any) {
      console.error('Failed to delete slot:', error);
      
      if (error.response?.status === 404) {
        toast.error('Slot not found or has already been deleted');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Cannot delete slot - it may be occupied or have parking history');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete slot. Please try again.');
      }
      setDeleteSlotId(null);
    } finally {
      setIsDeleting(false);
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
              <Button 
                variant="outline"
                onClick={() => setIsBulkCreateDialogOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Add
              </Button>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slot
              </Button>
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

          {/* Simple Slots Table */}
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
                        <div className="flex space-x-2">
                          {slot.status === 'AVAILABLE' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteSlotId(slot.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSlots.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-gray-500">
                          No slots available. Create your first slot to get started.
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

      {/* Bulk Create Dialog */}
      <Dialog open={isBulkCreateDialogOpen} onOpenChange={setIsBulkCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Create Slots</DialogTitle>
            <DialogDescription>
              Add multiple slots at once. Enter one slot per line in CSV format: slotNumber,slotType
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Slot Data (CSV Format)
              </label>
              <div className="text-xs text-gray-500 mb-2">
                Example: B1-01,REGULAR or A2-05,EV
              </div>
              <textarea
                className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none font-mono text-sm"
                placeholder={`B1-01,REGULAR
B1-02,REGULAR  
B1-03,COMPACT
B1-04,EV
B1-05,HANDICAP_ACCESSIBLE`}
                value={bulkSlots}
                onChange={(e) => setBulkSlots(e.target.value)}
              />
            </div>
            <div className="text-xs text-gray-500">
              Supported slot types: REGULAR, COMPACT, EV, HANDICAP_ACCESSIBLE
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCreateSlots} disabled={isBulkCreating}>
              {isBulkCreating ? 'Creating...' : 'Create Slots'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Slot Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                onValueChange={(value: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE') => 
                  setNewSlot(prev => ({ ...prev, slotType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select slot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="COMPACT">Compact</SelectItem>
                  <SelectItem value="EV">EV Charging</SelectItem>
                  <SelectItem value="HANDICAP_ACCESSIBLE">Handicap Accessible</SelectItem>
                </SelectContent>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteSlotId} onOpenChange={() => setDeleteSlotId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Slot</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this slot? This action cannot be undone.
              {deleteSlotId && (() => {
                const slot = slots.find(s => s.id === deleteSlotId);
                return slot ? ` Slot: ${slot.slotNumber}` : '';
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSlotId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteSlotId && handleDeleteSlot(deleteSlotId)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}