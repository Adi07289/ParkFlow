import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api';

// Slot API interfaces
export interface Slot {
  id: string;
  slotNumber: string;
  slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  currentSession?: any;
  sessionHistory?: any[];
}

export interface SlotsResponse {
  slots: Slot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateSlotRequest {
  slotNumber: string;
  slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

export interface UpdateSlotRequest {
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  slotType?: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

// API functions
export const slotsApi = {
  async getSlots(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<SlotsResponse> {
    const response = await axios.get(`${API_BASE_URL}/slots`, { params });
    return response.data.data;
  },

  async getSlot(slotId: string): Promise<Slot> {
    const response = await axios.get(`${API_BASE_URL}/slots/${slotId}`);
    return response.data.data;
  },

  async createSlot(data: CreateSlotRequest): Promise<Slot> {
    const response = await axios.post(`${API_BASE_URL}/slots`, data);
    return response.data.data;
  },

  async updateSlot(slotId: string, data: UpdateSlotRequest): Promise<Slot> {
    const response = await axios.put(`${API_BASE_URL}/slots/${slotId}`, data);
    return response.data.data;
  },

  async setMaintenance(slotId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/slots/${slotId}/maintenance`);
  },

  async releaseMaintenance(slotId: string): Promise<void> {
    await axios.post(`${API_BASE_URL}/slots/${slotId}/release-maintenance`);
  },

  async bulkCreateSlots(slots: CreateSlotRequest[]): Promise<{ count: number }> {
    const response = await axios.post(`${API_BASE_URL}/slots/bulk`, slots);
    return response.data.data;
  },

  async getAvailableSlots(vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE'): Promise<{
    success: boolean;
    data?: {
      slots: Array<{
        id: string;
        slotNumber: string;
        slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
      }>;
      groupedByType: Record<string, Array<{
        id: string;
        slotNumber: string;
        slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
      }>>;
      totalAvailable: number;
    };
    message?: string;
  }> {
    const params = vehicleType ? { vehicleType } : {};
    const response = await axios.get(`${API_BASE_URL}/slots/available`, { params });
    return response.data;
  },

  async reserveSlot(slotId: string): Promise<{
    success: boolean;
    message?: string;
    slot?: {
      id: string;
      slotNumber: string;
      slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
    };
  }> {
    const response = await axios.post(`${API_BASE_URL}/slots/${slotId}/reserve`);
    return response.data;
  },
};