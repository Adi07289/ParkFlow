import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query,
  Path
} from 'tsoa';
import { SessionStatus, VehicleType, BillingType } from '@prisma/client';
import { sessionService } from '../services/sessionService';

interface ExtendSessionRequest {
  sessionId: string;
  billingType: 'HOURLY' | 'DAY_PASS';
}

interface SessionResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface SessionSummary {
  id: string;
  vehicleNumberPlate: string;
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  slotNumber: string;
  entryTime: Date;
  exitTime?: Date;
  status: 'ACTIVE' | 'COMPLETED';
  billingType: 'HOURLY' | 'DAY_PASS';
  billingAmount?: number;
  duration?: string;
}

@Route('api/sessions')
@Tags('Sessions')
export class SessionController extends Controller {

  /**
   * Get all active sessions
   * @summary Get all currently active parking sessions
   */
  @Get('/active')
  @SuccessResponse(200, 'Active sessions retrieved successfully')
  public async getActiveSessions(
    @Query() vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE',
    @Query() page: number = 1,
    @Query() limit: number = 20
  ): Promise<SessionResponse> {
    try {
      const result = await sessionService.getActiveSessions({
        vehicleType,
        page,
        limit
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve active sessions'
      };
    }
  }

  /**
   * Get session by ID
   * @summary Get specific session details
   */
  @Get('/{sessionId}')
  @SuccessResponse(200, 'Session retrieved successfully')
  @Response(404, 'Session not found')
  public async getSessionById(@Path() sessionId: string): Promise<SessionResponse> {
    try {
      const session = await sessionService.getSessionById(sessionId);
      if (!session) {
        this.setStatus(404);
        return {
          success: false,
          message: 'Session not found'
        };
      }
      return {
        success: true,
        data: session
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve session'
      };
    }
  }

  /**
   * Get session by vehicle number plate
   * @summary Get active session for a specific vehicle
   */
  @Get('/vehicle/{numberPlate}')
  @SuccessResponse(200, 'Session retrieved successfully')
  @Response(404, 'No active session found for vehicle')
  public async getSessionByVehicle(@Path() numberPlate: string): Promise<SessionResponse> {
    try {
      const session = await sessionService.getSessionByVehicle(numberPlate);
      if (!session) {
        this.setStatus(404);
        return {
          success: false,
          message: 'No active session found for this vehicle'
        };
      }
      return {
        success: true,
        data: session
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve session'
      };
    }
  }

  /**
   * Extend session billing
   * @summary Extend parking session with additional billing
   */
  @Post('/extend')
  @SuccessResponse(200, 'Session extended successfully')
  @Response(404, 'Session not found or not active')
  public async extendSession(@Body() requestBody: ExtendSessionRequest): Promise<SessionResponse> {
    try {
      const result = await sessionService.extendSession(
        requestBody.sessionId,
        requestBody.billingType
      );
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to extend session'
      };
    }
  }

  /**
   * Get session history
   * @summary Get parking session history with filters
   */
  @Get('/history')
  @SuccessResponse(200, 'Session history retrieved successfully')
  public async getSessionHistory(
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE',
    @Query() status?: 'ACTIVE' | 'COMPLETED',
    @Query() page: number = 1,
    @Query() limit: number = 20
  ): Promise<SessionResponse> {
    try {
      const result = await sessionService.getSessionHistory({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        vehicleType,
        status,
        page,
        limit
      });
      return {
        success: true,
        data: result
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve session history'
      };
    }
  }

  /**
   * Calculate session cost
   * @summary Calculate current cost for an active session
   */
  @Get('/{sessionId}/cost')
  @SuccessResponse(200, 'Session cost calculated successfully')
  @Response(404, 'Session not found')
  public async calculateSessionCost(@Path() sessionId: string): Promise<SessionResponse> {
    try {
      const result = await sessionService.calculateSessionCost(sessionId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to calculate session cost'
      };
    }
  }

  /**
   * Force end session
   * @summary Force end a session (admin function)
   */
  @Post('/{sessionId}/force-end')
  @SuccessResponse(200, 'Session ended successfully')
  @Response(404, 'Session not found or already ended')
  public async forceEndSession(@Path() sessionId: string): Promise<SessionResponse> {
    try {
      const result = await sessionService.forceEndSession(sessionId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to end session'
      };
    }
  }

  /**
   * Get session statistics
   * @summary Get statistics about parking sessions
   */
  @Get('/stats')
  @SuccessResponse(200, 'Session statistics retrieved successfully')
  public async getSessionStats(
    @Query() period: 'day' | 'week' | 'month' = 'day'
  ): Promise<SessionResponse> {
    try {
      const stats = await sessionService.getSessionStats(period);
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve session statistics'
      };
    }
  }

  /**
   * Get overstay alerts
   * @summary Get sessions that have exceeded expected duration
   */
  @Get('/overstay-alerts')
  @SuccessResponse(200, 'Overstay alerts retrieved successfully')
  public async getOverstayAlerts(
    @Query() thresholdHours: number = 24
  ): Promise<SessionResponse> {
    try {
      const alerts = await sessionService.getOverstayAlerts(thresholdHours);
      return {
        success: true,
        data: alerts
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve overstay alerts'
      };
    }
  }
}