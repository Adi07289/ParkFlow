import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export interface QueueEntry {
  id: string;
  vehicleId: string;
  vehicleNumberPlate: string;
  vehicleType: string;
  requestedAt: string;
  status: string;
  position: number;
  estimatedWaitMinutes: number;
}

export interface IdleSession {
  sessionId: string;
  vehicleNumberPlate: string;
  vehicleType: string;
  slotNumber: string;
  entryTime: string;
  chargeCompleteAt: string;
  chargingStatus: string;
  idleMinutes: number;
  currentIdleFee: number;
  currency: string;
}

export const evApi = {
  async joinQueue(vehicleId: string) {
    const response = await axios.post(`${API_BASE_URL}/ev/queue/join`, { vehicleId });
    return response.data;
  },

  async getQueue(): Promise<{ queue: QueueEntry[]; totalWaiting: number }> {
    const response = await axios.get(`${API_BASE_URL}/ev/queue`);
    return response.data.data;
  },

  async getQueuePosition(vehicleId: string) {
    const response = await axios.get(`${API_BASE_URL}/ev/queue/${vehicleId}/position`);
    return response.data;
  },

  async leaveQueue(vehicleId: string) {
    const response = await axios.delete(`${API_BASE_URL}/ev/queue/${vehicleId}`);
    return response.data;
  },

  async notifyNext() {
    const response = await axios.post(`${API_BASE_URL}/ev/queue/notify-next`);
    return response.data;
  },

  async markChargingComplete(sessionId: string) {
    const response = await axios.post(`${API_BASE_URL}/ev/charging/${sessionId}/complete`);
    return response.data;
  },

  async getIdleFee(sessionId: string) {
    const response = await axios.get(`${API_BASE_URL}/ev/idle-fees/${sessionId}`);
    return response.data;
  },

  async getIdleSessions(): Promise<{ sessions: IdleSession[]; totalIdle: number }> {
    const response = await axios.get(`${API_BASE_URL}/ev/idle-sessions`);
    return response.data.data;
  },
};
