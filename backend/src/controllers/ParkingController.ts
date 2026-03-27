import {
  Controller,
  Post,
  Get,
  Body,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Query,
  Path
} from 'tsoa';
import { VehicleType, BillingType } from '@prisma/client';
import { parkingService } from '../services/parkingService';

interface VehicleEntryRequest {
  numberPlate: string;
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
  billingType: 'HOURLY' | 'DAY_PASS';
  slotId?: string; // Optional for manual slot override
}

interface VehicleEntryResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    vehicleId: string;
    slotId: string;
    slotNumber: string;
    entryTime: Date;
    billingType: 'HOURLY' | 'DAY_PASS';
  };
}

interface SearchVehicleResponse {
  success: boolean;
  data?: {
    vehicle: {
      id: string;
      numberPlate: string;
      vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
    };
    currentSession?: {
      id: string;
      slotNumber: string;
      entryTime: Date;
      billingType: 'HOURLY' | 'DAY_PASS';
      status: string;
    };
    parkingHistory: Array<{
      id: string;
      slotNumber: string;
      entryTime: Date;
      exitTime: Date | null;
      billingAmount: number;
      duration: string;
    }>;
  };
}

interface VehicleExitRequest {
  numberPlate: string;
}

interface VehicleExitResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    entryTime: Date;
    exitTime: Date;
    duration: string;
    billingAmount: number;
    billingType: 'HOURLY' | 'DAY_PASS';
  };
}

interface SlotOverrideRequest {
  newSlotId: string;
}

interface SlotOverrideResponse {
  success: boolean;
  message: string;
  data?: {
    sessionId: string;
    vehicleNumberPlate: string;
    oldSlot: {
      id: string;
      slotNumber: string;
      slotType: string;
    };
    newSlot: {
      id: string;
      slotNumber: string;
      slotType: string;
    };
    entryTime: Date;
    billingType: 'HOURLY' | 'DAY_PASS';
  };
}

@Route('api/parking')
@Tags('Parking')
export class ParkingController extends Controller {

  /**
   * Register vehicle entry
   * @summary Register a new vehicle entry with auto or manual slot assignment
   */
  @Post('/entry')
  @SuccessResponse(200, 'Vehicle entry registered successfully')
  @Response(400, 'Invalid request or no available slots')
  public async registerVehicleEntry(@Body() requestBody: VehicleEntryRequest): Promise<VehicleEntryResponse> {
    try {
      const result = await parkingService.registerVehicleEntry(requestBody);
      
      if (!result.success) {
        this.setStatus(400);
      }
      
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register vehicle entry'
      };
    }
  }

  /**
   * Search vehicle by number plate
   * @summary Search for a vehicle and get its current status and history
   */
  @Get('/search/{numberPlate}')
  @SuccessResponse(200, 'Vehicle found')
  @Response(404, 'Vehicle not found')
  public async searchVehicle(@Path() numberPlate: string): Promise<SearchVehicleResponse> {
    try {
      const result = await parkingService.searchVehicle(numberPlate);
      
      if (!result.success) {
        this.setStatus(404);
      }
      
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false
      };
    }
  }

  /**
   * Quick search vehicles
   * @summary Quick search vehicles by partial number plate
   */
  @Get('/quick-search')
  @SuccessResponse(200, 'Search results')
  public async quickSearch(@Query() query: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const results = await parkingService.quickSearchVehicles(query);
      return {
        success: true,
        data: results
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * Register vehicle exit
   * @summary Register vehicle exit and calculate billing
   */
  @Post('/exit')
  @SuccessResponse(200, 'Vehicle exit registered successfully')
  @Response(400, 'Vehicle not found or not currently parked')
  public async registerVehicleExit(@Body() requestBody: VehicleExitRequest): Promise<VehicleExitResponse> {
    try {
      const result = await parkingService.registerVehicleExit(requestBody.numberPlate);
      
      if (!result.success) {
        this.setStatus(400);
      }
      
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register vehicle exit'
      };
    }
  }

  /**
   * Get currently parked vehicles
   * @summary Get list of all currently parked vehicles
   */
  @Get('/current')
  @SuccessResponse(200, 'Currently parked vehicles retrieved')
  public async getCurrentlyParkedVehicles(
    @Query() vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE',
    @Query() page: number = 1,
    @Query() limit: number = 20
  ): Promise<{ success: boolean; data: any; pagination: any }> {
    try {
      const result = await parkingService.getCurrentlyParkedVehicles({
        vehicleType,
        page,
        limit
      });
      
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Get parking history
   * @summary Get parking history with filters
   */
  @Get('/history')
  @SuccessResponse(200, 'Parking history retrieved')
  public async getParkingHistory(
    @Query() startDate?: string,
    @Query() endDate?: string,
    @Query() vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE',
    @Query() page: number = 1,
    @Query() limit: number = 20
  ): Promise<{ success: boolean; data: any; pagination: any }> {
    try {
      const result = await parkingService.getParkingHistory({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        vehicleType,
        page,
        limit
      });
      
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  }

  /**
   * Override parking slot for active session
   * @summary Change parking slot for an active session without resetting entry time
   */
  @Post('/{sessionId}/override-slot')
  @SuccessResponse(200, 'Slot override successful')
  @Response(400, 'Invalid request or slot not available')
  @Response(404, 'Session not found')
  public async overrideSlot(
    @Path() sessionId: string,
    @Body() requestBody: SlotOverrideRequest
  ): Promise<SlotOverrideResponse> {
    try {
      const result = await parkingService.overrideSlot(sessionId, requestBody.newSlotId);
      
      if (!result.success) {
        this.setStatus(400);
      }
      
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to override slot'
      };
    }
  }
}