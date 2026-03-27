import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export interface ParkingAlertItem {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  isResolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
  vehicle: {
    numberPlate: string;
    vehicleType: string;
  } | null;
  slot: {
    slotNumber: string;
    slotType: string;
  } | null;
}

export interface AlertStats {
  periodDays: number;
  totalActive: number;
  totalResolved: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface RepeatOffender {
  vehicleId: string;
  numberPlate: string;
  vehicleType: string;
  alertCount: number;
}

export const alertsApi = {
  async getAlerts(params?: {
    alertType?: string;
    severity?: string;
    isResolved?: boolean;
    page?: number;
    limit?: number;
  }) {
    const response = await axios.get(`${API_BASE_URL}/alerts`, { params });
    return response.data.data;
  },

  async getAlertStats(periodDays: number = 7): Promise<AlertStats> {
    const response = await axios.get(`${API_BASE_URL}/alerts/stats`, { params: { periodDays } });
    return response.data.data;
  },

  async triggerScan() {
    const response = await axios.post(`${API_BASE_URL}/alerts/scan`);
    return response.data;
  },

  async resolveAlert(alertId: string, resolvedBy: string) {
    const response = await axios.post(`${API_BASE_URL}/alerts/${alertId}/resolve`, { resolvedBy });
    return response.data;
  },

  async createManualAlert(data: {
    sessionId?: string;
    vehicleId?: string;
    severity: string;
    message: string;
  }) {
    const response = await axios.post(`${API_BASE_URL}/alerts/manual`, data);
    return response.data;
  },

  async getRepeatOffenders(threshold: number = 3): Promise<RepeatOffender[]> {
    const response = await axios.get(`${API_BASE_URL}/alerts/offenders`, { params: { threshold } });
    return response.data.data.offenders;
  },
};
