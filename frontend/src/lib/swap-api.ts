import api from './api-client';

export interface SwapListing {
  id: string;
  sessionId: string;
  slotNumber: string;
  slotType: string;
  vehicleNumberPlate: string;
  originalUserId: string;
  ownerEmail?: string | null;
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
  async listForSwap(sessionId: string, listingPrice: number) {
    const response = await api.post('/swaps', { sessionId, listingPrice });
    return response.data;
  },

  async getAvailableSwaps(): Promise<SwapListing[]> {
    const response = await api.get('/swaps');
    return response.data.data.swaps;
  },

  async claimSwap(swapId: string) {
    const response = await api.post(`/swaps/${swapId}/claim`);
    return response.data;
  },

  async cancelListing(swapId: string) {
    const response = await api.delete(`/swaps/${swapId}`);
    return response.data;
  },

  async getUserHistory(): Promise<SwapHistory[]> {
    const response = await api.get('/swaps/history/me');
    return response.data.data.history;
  },
};
