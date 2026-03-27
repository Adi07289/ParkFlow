import {
  Controller,
  Get,
  Post,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Path,
  Body,
  Query
} from 'tsoa';
import { alertService } from '../services/alertService';

interface AlertResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface CreateManualAlertRequest {
  sessionId?: string;
  vehicleId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
}

interface ResolveAlertRequest {
  resolvedBy: string;
}

@Route('api/alerts')
@Tags('Parking Alerts')
export class AlertController extends Controller {

  /**
   * Get alerts
   * @summary List parking alerts with optional filters for type, severity, and resolution status
   */
  @Get('/')
  @SuccessResponse(200, 'Alerts retrieved')
  public async getAlerts(
    @Query() alertType?: 'OVERSTAY' | 'UNAUTHORIZED_AREA' | 'RAPID_ENTRY' | 'REPEATED_OFFENDER' | 'MANUAL',
    @Query() severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    @Query() isResolved?: boolean,
    @Query() page: number = 1,
    @Query() limit: number = 20
  ): Promise<AlertResponse> {
    try {
      const result = await alertService.getAlerts({
        alertType: alertType as any,
        severity: severity as any,
        isResolved,
        page,
        limit
      });
      return { success: true, data: result };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve alerts'
      };
    }
  }

  /**
   * Get alert statistics
   * @summary Get aggregated alert statistics by type and severity for the admin dashboard
   */
  @Get('/stats')
  @SuccessResponse(200, 'Stats retrieved')
  public async getAlertStats(@Query() periodDays: number = 7): Promise<AlertResponse> {
    try {
      const stats = await alertService.getAlertStats(periodDays);
      return { success: true, data: stats };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve alert stats'
      };
    }
  }

  /**
   * Trigger anomaly scan
   * @summary Run a full anomaly detection scan on all active sessions to detect and create alerts
   */
  @Post('/scan')
  @SuccessResponse(200, 'Scan completed')
  public async triggerScan(): Promise<AlertResponse> {
    try {
      const result = await alertService.detectAnomalies();
      return {
        success: true,
        message: `Scan complete: ${result.alertsCreated} new alerts created`,
        data: result
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to run anomaly scan'
      };
    }
  }

  /**
   * Resolve an alert
   * @summary Mark an alert as resolved by a specific operator
   */
  @Post('/{alertId}/resolve')
  @SuccessResponse(200, 'Alert resolved')
  @Response(404, 'Alert not found')
  public async resolveAlert(
    @Path() alertId: string,
    @Body() requestBody: ResolveAlertRequest
  ): Promise<AlertResponse> {
    try {
      const result = await alertService.resolveAlert(alertId, requestBody.resolvedBy);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resolve alert'
      };
    }
  }

  /**
   * Create manual alert
   * @summary Create a manual alert for a vehicle or session flagged by security staff
   */
  @Post('/manual')
  @SuccessResponse(201, 'Alert created')
  public async createManualAlert(@Body() requestBody: CreateManualAlertRequest): Promise<AlertResponse> {
    try {
      const result = await alertService.createManualAlert({
        sessionId: requestBody.sessionId,
        vehicleId: requestBody.vehicleId,
        severity: requestBody.severity as any,
        message: requestBody.message
      });
      if (result.success) {
        this.setStatus(201);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create alert'
      };
    }
  }

  /**
   * Get repeat offenders
   * @summary List vehicles with multiple alerts in the last 30 days
   */
  @Get('/offenders')
  @SuccessResponse(200, 'Offenders retrieved')
  public async getRepeatOffenders(@Query() threshold: number = 3): Promise<AlertResponse> {
    try {
      const offenders = await alertService.getRepeatOffenders(threshold);
      return {
        success: true,
        data: { offenders, total: offenders.length }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve offenders'
      };
    }
  }
}
