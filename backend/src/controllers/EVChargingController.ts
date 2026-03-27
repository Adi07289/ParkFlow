import {
  Controller,
  Get,
  Post,
  Delete,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Path,
  Body
} from 'tsoa';
import { evChargingService } from '../services/evChargingService';

interface EVResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface JoinQueueRequest {
  vehicleId: string;
}

@Route('api/ev')
@Tags('EV Charging')
export class EVChargingController extends Controller {

  /**
   * Join EV charging queue
   * @summary Add a vehicle to the EV charging queue when all EV slots are occupied
   */
  @Post('/queue/join')
  @SuccessResponse(201, 'Added to queue')
  @Response(400, 'Invalid request')
  public async joinQueue(@Body() requestBody: JoinQueueRequest): Promise<EVResponse> {
    try {
      const result = await evChargingService.joinQueue(requestBody.vehicleId);
      if (!result.success) {
        this.setStatus(400);
      } else {
        this.setStatus(201);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to join queue'
      };
    }
  }

  /**
   * Get EV charging queue
   * @summary View the current EV charging queue with positions and estimated wait times
   */
  @Get('/queue')
  @SuccessResponse(200, 'Queue retrieved')
  public async getQueue(): Promise<EVResponse> {
    try {
      const queue = await evChargingService.getQueue();
      return {
        success: true,
        data: {
          queue,
          totalWaiting: queue.length
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve queue'
      };
    }
  }

  /**
   * Get queue position for a vehicle
   * @summary Check a specific vehicle's position in the EV charging queue
   */
  @Get('/queue/{vehicleId}/position')
  @SuccessResponse(200, 'Position retrieved')
  @Response(404, 'Vehicle not in queue')
  public async getQueuePosition(@Path() vehicleId: string): Promise<EVResponse> {
    try {
      const result = await evChargingService.getQueuePosition(vehicleId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get queue position'
      };
    }
  }

  /**
   * Leave EV charging queue
   * @summary Remove a vehicle from the EV charging queue
   */
  @Delete('/queue/{vehicleId}')
  @SuccessResponse(200, 'Removed from queue')
  @Response(404, 'Vehicle not in queue')
  public async leaveQueue(@Path() vehicleId: string): Promise<EVResponse> {
    try {
      const result = await evChargingService.leaveQueue(vehicleId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to leave queue'
      };
    }
  }

  /**
   * Notify next in queue
   * @summary Notify the next vehicle in queue that an EV slot is available
   */
  @Post('/queue/notify-next')
  @SuccessResponse(200, 'Next vehicle notified')
  public async notifyNext(): Promise<EVResponse> {
    try {
      const result = await evChargingService.notifyNextInQueue();
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to notify next in queue'
      };
    }
  }

  /**
   * Mark charging complete
   * @summary Mark an EV session's charging as complete — idle fees begin accruing
   */
  @Post('/charging/{sessionId}/complete')
  @SuccessResponse(200, 'Charging marked complete')
  @Response(404, 'Session not found')
  public async markChargingComplete(@Path() sessionId: string): Promise<EVResponse> {
    try {
      const result = await evChargingService.markChargingComplete(sessionId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mark charging complete'
      };
    }
  }

  /**
   * Get idle fee for a session
   * @summary Calculate the current idle fee for a fully-charged EV that is still occupying a slot
   */
  @Get('/idle-fees/{sessionId}')
  @SuccessResponse(200, 'Idle fee calculated')
  @Response(404, 'No idle session found')
  public async getIdleFee(@Path() sessionId: string): Promise<EVResponse> {
    try {
      const result = await evChargingService.calculateIdleFee(sessionId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to calculate idle fee'
      };
    }
  }

  /**
   * Get all idle EV sessions
   * @summary List all EV sessions that are fully charged but still occupying a slot
   */
  @Get('/idle-sessions')
  @SuccessResponse(200, 'Idle sessions retrieved')
  public async getIdleSessions(): Promise<EVResponse> {
    try {
      const sessions = await evChargingService.getIdleSessions();
      return {
        success: true,
        data: {
          sessions,
          totalIdle: sessions.length
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve idle sessions'
      };
    }
  }
}
