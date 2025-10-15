import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api';

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
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    return response.data.data;
  },

  async getRevenue(): Promise<RevenueStats> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/revenue`);
    return response.data.data;
  },

  async getActivity(): Promise<ActivityStats> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/activity`);
    return response.data.data;
  },

  async getOccupancyTrends(): Promise<OccupancyTrend[]> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/occupancy-trends`);
    return response.data.data;
  },

  async getRealtimeData(): Promise<RealtimeData> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/realtime`);
    return response.data.data;
  },

  async getSlotAvailability(): Promise<SlotAvailability> {
    const response = await axios.get(`${API_BASE_URL}/dashboard/slot-availability`);
    return response.data.data;
  },
};