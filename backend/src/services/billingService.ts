import { BillingType } from '@prisma/client';

// Billing configuration interface
interface BillingConfig {
  hourlyRates: {
    minHours: number;
    maxHours: number;
    rate: number;
  }[];
  dayPassRate: number;
  currency: string;
}

// Default billing configuration
const DEFAULT_BILLING_CONFIG: BillingConfig = {
  hourlyRates: [
    { minHours: 0, maxHours: 1, rate: 50 },      // 0-1 hour → ₹50
    { minHours: 1, maxHours: 3, rate: 100 },     // 1-3 hours → ₹100
    { minHours: 3, maxHours: 6, rate: 150 },     // 3-6 hours → ₹150
    { minHours: 6, maxHours: 24, rate: 200 },    // 6+ hours → ₹200 (max cap per day)
  ],
  dayPassRate: 150, // ₹150 flat fee for day pass
  currency: '₹'
};

class BillingService {
  private billingConfig: BillingConfig;

  constructor() {
    this.billingConfig = DEFAULT_BILLING_CONFIG;
  }

  /**
   * Calculate billing amount based on duration and billing type
   */
  calculateBillingAmount(
    entryTime: Date, 
    exitTime: Date, 
    billingType: BillingType
  ): {
    amount: number;
    duration: string;
    durationHours: number;
    appliedRate?: { minHours: number; maxHours: number; rate: number };
  } {
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to next hour
    const duration = this.formatDuration(durationMs);

    if (billingType === BillingType.DAY_PASS) {
      return {
        amount: this.billingConfig.dayPassRate,
        duration,
        durationHours,
      };
    }

    // Hourly billing with slab-based pricing
    const appliedRate = this.getHourlyRate(durationHours);
    
    return {
      amount: appliedRate.rate,
      duration,
      durationHours,
      appliedRate,
    };
  }

  /**
   * Get the applicable hourly rate based on duration
   */
  private getHourlyRate(durationHours: number): { minHours: number; maxHours: number; rate: number } {
    for (const rate of this.billingConfig.hourlyRates) {
      if (durationHours > rate.minHours && durationHours <= rate.maxHours) {
        return rate;
      }
    }
    
    // If duration exceeds all configured rates, return the highest rate (cap)
    return this.billingConfig.hourlyRates[this.billingConfig.hourlyRates.length - 1];
  }

  /**
   * Get day pass rate
   */
  getDayPassRate(): number {
    return this.billingConfig.dayPassRate;
  }

  /**
   * Get hourly rates configuration
   */
  getHourlyRates(): { minHours: number; maxHours: number; rate: number }[] {
    return this.billingConfig.hourlyRates;
  }

  /**
   * Get currency symbol
   */
  getCurrency(): string {
    return this.billingConfig.currency;
  }

  /**
   * Get complete billing configuration
   */
  getBillingConfig(): BillingConfig {
    return { ...this.billingConfig };
  }

  /**
   * Update billing configuration (for admin use)
   */
  updateBillingConfig(newConfig: Partial<BillingConfig>): void {
    this.billingConfig = { ...this.billingConfig, ...newConfig };
  }

  /**
   * Format duration from milliseconds to human-readable string
   */
  private formatDuration(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  /**
   * Calculate estimated cost for ongoing session
   */
  calculateEstimatedCost(entryTime: Date, billingType: BillingType): {
    currentDuration: string;
    estimatedAmount: number;
    durationHours: number;
  } {
    const now = new Date();
    const result = this.calculateBillingAmount(entryTime, now, billingType);
    
    return {
      currentDuration: result.duration,
      estimatedAmount: result.amount,
      durationHours: result.durationHours,
    };
  }

  /**
   * Get billing preview for different durations
   */
  getBillingPreview(): {
    hourlyRates: Array<{
      duration: string;
      rate: number;
      description: string;
    }>;
    dayPass: {
      rate: number;
      description: string;
    };
  } {
    const hourlyRates = this.billingConfig.hourlyRates.map(rate => ({
      duration: rate.maxHours === 24 
        ? `${rate.minHours}+ hours`
        : `${rate.minHours}-${rate.maxHours} hour${rate.maxHours > 1 ? 's' : ''}`,
      rate: rate.rate,
      description: rate.maxHours === 24 
        ? 'Maximum daily rate'
        : `Per ${rate.maxHours - rate.minHours} hour${rate.maxHours - rate.minHours > 1 ? 's' : ''}`
    }));

    return {
      hourlyRates,
      dayPass: {
        rate: this.billingConfig.dayPassRate,
        description: 'Unlimited parking for the day'
      }
    };
  }
}

export const billingService = new BillingService();