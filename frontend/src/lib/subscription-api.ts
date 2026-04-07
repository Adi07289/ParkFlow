import api from './api-client';

export interface TierBenefits {
  tier: string;
  discountPercent: number;
  priorityBooking: boolean;
  pointsMultiplier: number;
  monthlyPrice: number;
  description: string;
}

export interface SubscriptionData {
  id: string;
  tier: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  loyaltyPoints: number;
  totalSpent: number;
  benefits: TierBenefits;
  pointRedemptionValue: string;
  redeemableAmount: number;
}

export const subscriptionApi = {
  async createSubscription(userId: string, tier: string, durationMonths: number = 1) {
    const response = await api.post('/subscriptions', { userId, tier, durationMonths });
    return response.data;
  },

  async getSubscription(userId: string): Promise<SubscriptionData> {
    const response = await api.get(`/subscriptions/${userId}`);
    return response.data.data;
  },

  async addPoints(userId: string, amountSpent: number) {
    const response = await api.post(`/subscriptions/${userId}/points/add`, { amountSpent });
    return response.data;
  },

  async redeemPoints(userId: string, points: number) {
    const response = await api.post(`/subscriptions/${userId}/points/redeem`, { points });
    return response.data;
  },

  async getTiers(): Promise<TierBenefits[]> {
    const response = await api.get('/subscriptions/tiers/all');
    return response.data.data.tiers;
  },

  async cancelSubscription(userId: string) {
    const response = await api.delete(`/subscriptions/${userId}`);
    return response.data;
  },
};
