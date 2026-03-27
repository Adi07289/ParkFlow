import {
  Controller,
  Get,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query
} from 'tsoa';
import { analyticsService } from '../services/analyticsService';
import { overstayService } from '../services/overstayService';

interface AnalyticsResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Route('api/analytics')
@Tags('Analytics')
export class AnalyticsController extends Controller {

  /**
   * Get revenue analytics
   * @summary Get comprehensive revenue analytics with trends
   */
  @Get('/revenue')
  @SuccessResponse(200, 'Revenue analytics retrieved successfully')
  public async getRevenueAnalytics(
    @Query() period: 'day' | 'week' | 'month' = 'day',
    @Query() startDate?: string,
    @Query() endDate?: string
  ): Promise<AnalyticsResponse> {
    try {
      const data = await analyticsService.getRevenueAnalytics(
        period,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve revenue analytics'
      };
    }
  }

  /**
   * Get slot utilization analytics
   * @summary Get slot utilization efficiency metrics
   */
  @Get('/utilization')
  @SuccessResponse(200, 'Slot utilization analytics retrieved successfully')
  public async getSlotUtilizationAnalytics(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<AnalyticsResponse> {
    try {
      const data = await analyticsService.getSlotUtilizationAnalytics(period);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve slot utilization analytics'
      };
    }
  }

  /**
   * Get peak hours analytics
   * @summary Get peak hours and traffic patterns
   */
  @Get('/peak-hours')
  @SuccessResponse(200, 'Peak hours analytics retrieved successfully')
  public async getPeakHoursAnalytics(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<AnalyticsResponse> {
    try {
      const data = await analyticsService.getPeakHourAnalytics(period);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve peak hours analytics'
      };
    }
  }

  /**
   * Get vehicle type analytics
   * @summary Get analytics by vehicle type
   */
  @Get('/vehicle-types')
  @SuccessResponse(200, 'Vehicle type analytics retrieved successfully')
  public async getVehicleTypeAnalytics(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<AnalyticsResponse> {
    try {
      const data = await analyticsService.getVehicleTypeAnalytics(period);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve vehicle type analytics'
      };
    }
  }

  /**
   * Get operational metrics
   * @summary Get key operational metrics and KPIs
   */
  @Get('/operational-metrics')
  @SuccessResponse(200, 'Operational metrics retrieved successfully')
  public async getOperationalMetrics(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<AnalyticsResponse> {
    try {
      const data = await analyticsService.getOperationalMetrics(period);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve operational metrics'
      };
    }
  }

  /**
   * Get overstay alerts
   * @summary Get current overstay alerts and violations
   */
  @Get('/overstay-alerts')
  @SuccessResponse(200, 'Overstay alerts retrieved successfully')
  public async getOverstayAlerts(): Promise<AnalyticsResponse> {
    try {
      const data = await overstayService.getOverstayAlerts();
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve overstay alerts'
      };
    }
  }

  /**
   * Get overstay statistics
   * @summary Get overstay statistics and trends
   */
  @Get('/overstay-stats')
  @SuccessResponse(200, 'Overstay statistics retrieved successfully')
  public async getOverstayStats(
    @Query() periodDays: number = 7
  ): Promise<AnalyticsResponse> {
    try {
      const data = await overstayService.getOverstayStats(periodDays);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve overstay statistics'
      };
    }
  }

  /**
   * Get comprehensive dashboard data
   * @summary Get all analytics data for dashboard
   */
  @Get('/dashboard')
  @SuccessResponse(200, 'Dashboard analytics retrieved successfully')
  public async getDashboardAnalytics(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<AnalyticsResponse> {
    try {
      const [
        revenue,
        utilization,
        peakHours,
        vehicleTypes,
        operational,
        overstayAlerts,
        overstayStats
      ] = await Promise.all([
        analyticsService.getRevenueAnalytics(period),
        analyticsService.getSlotUtilizationAnalytics(period),
        analyticsService.getPeakHourAnalytics(period),
        analyticsService.getVehicleTypeAnalytics(period),
        analyticsService.getOperationalMetrics(period),
        overstayService.getOverstayAlerts(),
        overstayService.getOverstayStats(7)
      ]);

      return {
        success: true,
        data: {
          revenue,
          utilization,
          peakHours,
          vehicleTypes,
          operational,
          overstayAlerts,
          overstayStats,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve dashboard analytics'
      };
    }
  }
}