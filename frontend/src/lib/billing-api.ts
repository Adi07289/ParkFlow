import api from './api-client';

// Billing API interfaces
export interface BillingConfig {
  hourlyRates: Array<{
    minHours: number;
    maxHours: number;
    rate: number;
  }>;
  dayPassRate: number;
  currency: string;
}

export interface BillingRates {
  hourlyRates: Array<{
    duration: string;
    rate: number;
    description: string;
  }>;
  dayPass: {
    rate: number;
    description: string;
  };
}

export interface CostEstimate {
  currentDuration: string;
  estimatedAmount: number;
  durationHours: number;
  currency: string;
}

export interface BillingCalculation {
  amount: number;
  duration: string;
  durationHours: number;
  currency: string;
  appliedRate?: {
    minHours: number;
    maxHours: number;
    rate: number;
  };
}

// API functions
export const billingApi = {
  async getBillingConfig(): Promise<BillingConfig> {
    const response = await api.get('/billing/config');
    return response.data.data;
  },

  async getBillingRates(): Promise<BillingRates> {
    const response = await api.get('/billing/rates');
    return response.data.data;
  },

  async calculateCostEstimate(entryTime: string, billingType: 'HOURLY' | 'DAY_PASS'): Promise<CostEstimate> {
    const response = await api.post('/billing/estimate', {
      entryTime,
      billingType
    });
    return response.data.data;
  },

  async calculateBilling(
    entryTime: string, 
    exitTime: string, 
    billingType: 'HOURLY' | 'DAY_PASS'
  ): Promise<BillingCalculation> {
    const response = await api.get('/billing/calculate', {
      params: {
        entryTime,
        exitTime,
        billingType
      }
    });
    return response.data.data;
  },
};
