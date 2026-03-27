import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export interface SwapListing {
  id: string;
  slotNumber: string;
  slotType: string;
  vehicleNumberPlate: string;
  originalPrice: number;
  listingPrice: number;
  listedAt: string;
  expiresAt: string;
  savings: number;
  currency: string;
}

export interface SwapHistory {
  id: string;
  slotNumber: string;
  vehicleNumberPlate: string;
  originalPrice: number;
  listingPrice: number;
  status: string;
  role: 'SELLER' | 'BUYER';
  listedAt: string;
  claimedAt: string | null;
  currency: string;
}

export const swapApi = {
  async listForSwap(userId: string, sessionId: string, listingPrice: number) {
    const response = await axios.post(`${API_BASE_URL}/swaps`, { userId, sessionId, listingPrice });
    return response.data;
  },

  async getAvailableSwaps(): Promise<SwapListing[]> {
    const response = await axios.get(`${API_BASE_URL}/swaps`);
    return response.data.data.swaps;
  },

  async claimSwap(swapId: string, userId: string) {
    const response = await axios.post(`${API_BASE_URL}/swaps/${swapId}/claim`, { userId });
    return response.data;
  },

  async cancelListing(swapId: string, userId: string) {
    const response = await axios.delete(`${API_BASE_URL}/swaps/${swapId}`, { params: { userId } });
    return response.data;
  },

  async getUserHistory(userId: string): Promise<SwapHistory[]> {
    const response = await axios.get(`${API_BASE_URL}/swaps/history/${userId}`);
    return response.data.data.history;
  },
};
