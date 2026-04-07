import api from './api-client';

// Parking API interfaces
export interface Vehicle {
  id: string;
  numberPlate: string;
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

export interface CurrentSession {
  id: string;
  status: string;
  billingType: 'HOURLY' | 'DAY_PASS';
  entryTime: string;
  slotNumber: string;
  user?: {
    id: string;
    email: string;
  } | null;
}

export interface ParkingHistory {
  id: string;
  slotNumber: string;
  entryTime: string;
  exitTime: string | null;
  duration: string;
  billingAmount: number;
}

export interface VehicleSearchResponse {
  vehicle: Vehicle;
  currentSession?: CurrentSession;
  parkingHistory: ParkingHistory[];
}

export interface CurrentlyParkedVehicle {
  sessionId: string;
  vehicle: {
    id: string;
    numberPlate: string;
    vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  };
  user?: {
    id: string;
    email: string;
  } | null;
  slot: {
    number: string;
    type: string;
  };
  entryTime: string;
  duration: string;
  billingType: 'HOURLY' | 'DAY_PASS';
}

export interface CurrentParkedResponse {
  vehicles: CurrentlyParkedVehicle[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuickSearchResult {
  vehicleId: string;
  numberPlate: string;
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  isCurrentlyParked: boolean;
  currentSlot?: string;
}

export interface SlotOverrideRequest {
  newSlotId: string;
}

export interface SlotOverrideResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    vehicleNumberPlate: string;
    oldSlot: {
      id: string;
      slotNumber: string;
      slotType: string;
    };
    newSlot: {
      id: string;
      slotNumber: string;
      slotType: string;
    };
    entryTime: string;
    billingType: 'HOURLY' | 'DAY_PASS';
  };
}

// API functions
export const parkingApi = {
  // Search for a specific vehicle by number plate
  async searchVehicle(numberPlate: string): Promise<VehicleSearchResponse> {
    const response = await api.get(`/parking/search/${numberPlate}`);
    return response.data.data;
  },

  // Get currently parked vehicles with filtering
  async getCurrentlyParkedVehicles(params?: {
    vehicleType?: string;
    page?: number;
    limit?: number;
  }): Promise<CurrentParkedResponse> {
    const response = await api.get('/parking/current', { params });
    return {
      vehicles: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  },

  // Quick search for vehicles (autocomplete)
  async quickSearch(query: string): Promise<QuickSearchResult[]> {
    const response = await api.get('/parking/quick-search', {
      params: { query }
    });
    const results = response.data.data || [];

    return results.map((result: {
      id?: string;
      vehicleId?: string;
      numberPlate: string;
      vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
      isCurrentlyParked?: boolean;
      currentSlot?: string;
    }) => ({
      vehicleId: result.vehicleId || result.id || '',
      numberPlate: result.numberPlate,
      vehicleType: result.vehicleType,
      isCurrentlyParked: Boolean(result.isCurrentlyParked),
      currentSlot: result.currentSlot,
    })).filter((result: QuickSearchResult) => result.vehicleId);
  },

  // Get parking history
  async getParkingHistory(params?: {
    startDate?: string;
    endDate?: string;
    vehicleType?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/parking/history', { params });
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
  },

  // Register vehicle entry
  async registerVehicleEntry(data: {
    numberPlate: string;
    vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
    billingType: 'HOURLY' | 'DAY_PASS';
    slotId?: string;
    userId?: string;
  }): Promise<any> {
    const response = await api.post('/parking/entry', data);
    return response.data; // Return the full response including success field
  },

  // Register vehicle exit
  async registerVehicleExit(numberPlate: string): Promise<any> {
    const response = await api.post('/parking/exit', { numberPlate });
    return response.data; // Return the full response including success field
  },

  // Override parking slot for active session
  async overrideSlot(sessionId: string, newSlotId: string): Promise<SlotOverrideResponse> {
    const response = await api.post(`/parking/${sessionId}/override-slot`, {
      newSlotId
    });
    return response.data;
  },
};
