import api from './api-client';

// Dashboard API interfaces
export interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  maintenanceSlots: number;
  occupancyRate: number;
  slotsByType: {
    type: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
  }[];
  vehiclesByType: {
    type: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
    count: number;
    percentage: number;
  }[];
}

export interface RevenueStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  byBillingType: {
    hourly: number;
    dayPass: number;
  };
  currency: string;
}

export interface ActivityStats {
  entriesLastHour: number;
  exitsLastHour: number;
  averageParkingDuration: string;
  peakHours: {
    hour: number;
    entries: number;
  }[];
}

export interface OccupancyTrend {
  period: string;
  occupancy: number;
  timestamp: string;
}

export interface RealtimeData {
  lastUpdate: string;
  recentEntries: any[];
  recentExits: any[];
  alerts: any[];
}

export interface SlotAvailability {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  slots: any[];
}

// API functions
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  async getRevenue(): Promise<RevenueStats> {
    const response = await api.get('/dashboard/revenue');
    return response.data.data;
  },

  async getActivity(): Promise<ActivityStats> {
    const response = await api.get('/dashboard/activity');
    return response.data.data;
  },

  async getOccupancyTrends(): Promise<OccupancyTrend[]> {
    const response = await api.get('/dashboard/occupancy-trends');
    return response.data.data;
  },

  async getRealtimeData(): Promise<RealtimeData> {
    const response = await api.get('/dashboard/realtime');
    return response.data.data;
  },

  async getSlotAvailability(): Promise<SlotAvailability> {
    const response = await api.get('/dashboard/slot-availability');
    return response.data.data;
  },
};
