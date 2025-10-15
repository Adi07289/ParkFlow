import {
  Controller,
  Get,
  Post,
  Body,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query,
  Path
} from 'tsoa';
import { BillingType } from '@prisma/client';
import { billingService } from '../services/billingService';

interface BillingConfigResponse {
  success: boolean;
  data: {
    hourlyRates: Array<{
      minHours: number;
      maxHours: number;
      rate: number;
    }>;
    dayPassRate: number;
    currency: string;
  };
}

interface BillingPreviewResponse {
  success: boolean;
  data: {
    hourlyRates: Array<{
      duration: string;
      rate: number;
      description: string;
    }>;
    dayPass: {
      rate: number;
      description: string;
    };
  };
}

interface CostEstimateRequest {
  entryTime: string;
  billingType: 'HOURLY' | 'DAY_PASS';
}

interface CostEstimateResponse {
  success: boolean;
  data: {
    currentDuration: string;
    estimatedAmount: number;
    durationHours: number;
    currency: string;
  };
}

@Route('api/billing')
@Tags('Billing')
export class BillingController extends Controller {

  /**
   * Get billing configuration
   * @summary Get current billing rates and configuration
   */
  @Get('/config')
  @SuccessResponse(200, 'Billing configuration retrieved successfully')
  public async getBillingConfig(): Promise<BillingConfigResponse> {
    try {
      const config = billingService.getBillingConfig();
      return {
        success: true,
        data: {
          hourlyRates: config.hourlyRates,
          dayPassRate: config.dayPassRate,
          currency: config.currency
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          hourlyRates: [],
          dayPassRate: 0,
          currency: '₹'
        }
      };
    }
  }

  /**
   * Get billing rates preview
   * @summary Get user-friendly billing rates preview
   */
  @Get('/rates')
  @SuccessResponse(200, 'Billing rates retrieved successfully')
  public async getBillingRates(): Promise<BillingPreviewResponse> {
    try {
      const preview = billingService.getBillingPreview();
      return {
        success: true,
        data: preview
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          hourlyRates: [],
          dayPass: {
            rate: 0,
            description: ''
          }
        }
      };
    }
  }

  /**
   * Calculate cost estimate for ongoing session
   * @summary Calculate estimated cost for active parking session
   */
  @Post('/estimate')
  @SuccessResponse(200, 'Cost estimate calculated successfully')
  @Response(400, 'Invalid request data')
  public async calculateCostEstimate(
    @Body() requestBody: CostEstimateRequest
  ): Promise<CostEstimateResponse> {
    try {
      const entryTime = new Date(requestBody.entryTime);
      const billingType = requestBody.billingType as BillingType;

      if (isNaN(entryTime.getTime())) {
        this.setStatus(400);
        return {
          success: false,
          data: {
            currentDuration: '0h 0m',
            estimatedAmount: 0,
            durationHours: 0,
            currency: billingService.getCurrency()
          }
        };
      }

      const estimate = billingService.calculateEstimatedCost(entryTime, billingType);
      
      return {
        success: true,
        data: {
          currentDuration: estimate.currentDuration,
          estimatedAmount: estimate.estimatedAmount,
          durationHours: estimate.durationHours,
          currency: billingService.getCurrency()
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          currentDuration: '0h 0m',
          estimatedAmount: 0,
          durationHours: 0,
          currency: billingService.getCurrency()
        }
      };
    }
  }

  /**
   * Calculate billing for specific duration
   * @summary Calculate billing amount for given entry and exit times
   */
  @Get('/calculate')
  @SuccessResponse(200, 'Billing calculated successfully')
  @Response(400, 'Invalid parameters')
  public async calculateBilling(
    @Query() entryTime: string,
    @Query() exitTime: string,
    @Query() billingType: 'HOURLY' | 'DAY_PASS'
  ): Promise<{
    success: boolean;
    data: {
      amount: number;
      duration: string;
      durationHours: number;
      currency: string;
      appliedRate?: {
        minHours: number;
        maxHours: number;
        rate: number;
      };
    };
  }> {
    try {
      const entry = new Date(entryTime);
      const exit = new Date(exitTime);
      const billing = billingType as BillingType;

      if (isNaN(entry.getTime()) || isNaN(exit.getTime())) {
        this.setStatus(400);
        return {
          success: false,
          data: {
            amount: 0,
            duration: '0h 0m',
            durationHours: 0,
            currency: billingService.getCurrency()
          }
        };
      }

      if (exit <= entry) {
        this.setStatus(400);
        return {
          success: false,
          data: {
            amount: 0,
            duration: '0h 0m',
            durationHours: 0,
            currency: billingService.getCurrency()
          }
        };
      }

      const result = billingService.calculateBillingAmount(entry, exit, billing);
      
      return {
        success: true,
        data: {
          amount: result.amount,
          duration: result.duration,
          durationHours: result.durationHours,
          currency: billingService.getCurrency(),
          appliedRate: result.appliedRate
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: {
          amount: 0,
          duration: '0h 0m',
          durationHours: 0,
          currency: billingService.getCurrency()
        }
      };
    }
  }
}