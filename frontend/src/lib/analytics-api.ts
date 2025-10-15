import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api';

// Analytics API interfaces
export interface RevenueAnalytics {
  period: string;
  totalRevenue: number;
  hourlyRevenue: number;
  dayPassRevenue: number;
  transactionCount: number;
  averageTransactionValue: number;
  growthRate: number;
}

export interface SlotUtilizationAnalytics {
  slotType: string;
  totalSlots: number;
  averageOccupancy: number;
  peakOccupancy: number;
  totalRevenue: number;
  utilizationRate: number;
  revenuePerSlot: number;
}

export interface PeakHourAnalytics {
  hour: number;
  entries: number;
  exits: number;
  revenue: number;
  occupancyRate: number;
  averageStayDuration: number;
}

export interface VehicleTypeAnalytics {
  vehicleType: string;
  count: number;
  percentage: number;
  averageDuration: number;
  totalRevenue: number;
  revenuePerVehicle: number;
}

export interface OperationalMetrics {
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  averageStayDuration: number;
  turnoverRate: number;
  peakCapacityUtilization: number;
  overstayRate: number;
}

export interface OverstayAlert {
  sessionId: string;
  vehicle: {
    numberPlate: string;
    vehicleType: string;
  };
  slot: {
    slotNumber: string;
    slotType: string;
  };
  entryTime: string;
  duration: string;
  durationHours: number;
  billingType: string;
  severity: 'warning' | 'alert' | 'critical';
  expectedDuration: number;
  overstayHours: number;
  estimatedCost: number;
}

export interface OverstayStats {
  totalOverstays: number;
  byVehicleType: Record<string, number>;
  bySeverity: Record<string, number>;
  averageOverstayDuration: number;
  totalLostRevenue: number;
}

// API functions
export const analyticsApi = {
  // Revenue Analytics
  async getRevenueAnalytics(params?: {
    period?: 'day' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }): Promise<RevenueAnalytics[]> {
    const response = await axios.get(`${API_BASE_URL}/analytics/revenue`, { params });
    return response.data.data;
  },

  // Slot Utilization Analytics
  async getSlotUtilizationAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<SlotUtilizationAnalytics[]> {
    const response = await axios.get(`${API_BASE_URL}/analytics/utilization`, { 
      params: { period } 
    });
    return response.data.data;
  },

  // Peak Hours Analytics
  async getPeakHoursAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<PeakHourAnalytics[]> {
    const response = await axios.get(`${API_BASE_URL}/analytics/peak-hours`, { 
      params: { period } 
    });
    return response.data.data;
  },

  // Vehicle Types Analytics
  async getVehicleTypeAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<VehicleTypeAnalytics[]> {
    const response = await axios.get(`${API_BASE_URL}/analytics/vehicle-types`, { 
      params: { period } 
    });
    return response.data.data;
  },

  // Operational Metrics
  async getOperationalMetrics(period: 'day' | 'week' | 'month' = 'day'): Promise<OperationalMetrics> {
    const response = await axios.get(`${API_BASE_URL}/analytics/operational-metrics`, { 
      params: { period } 
    });
    return response.data.data;
  },

  // Overstay Alerts
  async getOverstayAlerts(): Promise<OverstayAlert[]> {
    const response = await axios.get(`${API_BASE_URL}/analytics/overstay-alerts`);
    return response.data.data;
  },

  // Overstay Statistics
  async getOverstayStats(periodDays: number = 7): Promise<OverstayStats> {
    const response = await axios.get(`${API_BASE_URL}/analytics/overstay-stats`, { 
      params: { periodDays } 
    });
    return response.data.data;
  },

  // Comprehensive Dashboard Data
  async getDashboardAnalytics(period: 'day' | 'week' | 'month' = 'day'): Promise<{
    revenue: RevenueAnalytics[];
    utilization: SlotUtilizationAnalytics[];
    peakHours: PeakHourAnalytics[];
    vehicleTypes: VehicleTypeAnalytics[];
    operational: OperationalMetrics;
    overstayAlerts: OverstayAlert[];
    overstayStats: OverstayStats;
    generatedAt: string;
  }> {
    const response = await axios.get(`${API_BASE_URL}/analytics/dashboard`, { 
      params: { period } 
    });
    return response.data.data;
  }
};