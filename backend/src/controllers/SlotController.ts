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
import { SlotType, SlotStatus, VehicleType } from '@prisma/client';
import { slotService } from '../services/slotService';

interface CreateSlotRequest {
  slotNumber: string;
  slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface UpdateSlotRequest {
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  slotType?: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface SlotResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface AutoAssignRequest {
  vehicleType: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE';
}

interface AutoAssignResponse {
  success: boolean;
  message?: string;
  slot?: {
    id: string;
    slotNumber: string;
    slotType: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE';
  };
}

@Route('api/slots')
@Tags('Slots')
export class SlotController extends Controller {

  /**
   * Get all slots
   * @summary Get all parking slots with filters
   */
  @Get('/')
  @SuccessResponse(200, 'Slots retrieved successfully')
  public async getSlots(
    @Query() status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE',
    @Query() type?: 'REGULAR' | 'COMPACT' | 'EV' | 'HANDICAP_ACCESSIBLE',
    @Query() page: number = 1,
    @Query() limit: number = 50
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.getSlots({
        status,
        type,
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
        message: error instanceof Error ? error.message : 'Failed to retrieve slots'
      };
    }
  }

  /**
   * Get slot availability map
   * @summary Get visual representation of slot availability
   */
  @Get('/availability-map')
  @SuccessResponse(200, 'Availability map retrieved successfully')
  public async getAvailabilityMap(): Promise<SlotResponse> {
    try {
      const map = await slotService.getAvailabilityMap();
      return {
        success: true,
        data: map
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve availability map'
      };
    }
  }

  /**
   * Get available slots
   * @summary Get all available slots, optionally filtered by vehicle type compatibility
   */
  @Get('/available')
  @SuccessResponse(200, 'Available slots retrieved successfully')
  public async getAvailableSlots(
    @Query() vehicleType?: 'CAR' | 'BIKE' | 'EV' | 'HANDICAP_ACCESSIBLE'
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.getAvailableSlots(vehicleType as any);
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve available slots'
      };
    }
  }

  /**
   * Get slot by ID
   * @summary Get specific slot details
   */
  @Get('/{slotId}')
  @SuccessResponse(200, 'Slot retrieved successfully')
  @Response(404, 'Slot not found')
  public async getSlotById(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const slot = await slotService.getSlotById(slotId);
      if (!slot) {
        this.setStatus(404);
        return {
          success: false,
          message: 'Slot not found'
        };
      }
      return {
        success: true,
        data: slot
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve slot'
      };
    }
  }

  /**
   * Create new slot
   * @summary Create a new parking slot
   */
  @Post('/')
  @SuccessResponse(201, 'Slot created successfully')
  @Response(400, 'Invalid request or slot number already exists')
  public async createSlot(@Body() requestBody: CreateSlotRequest): Promise<SlotResponse> {
    try {
      const result = await slotService.createSlot(requestBody);
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
        message: error instanceof Error ? error.message : 'Failed to create slot'
      };
    }
  }

  /**
   * Update slot
   * @summary Update slot status or type
   */
  @Put('/{slotId}')
  @SuccessResponse(200, 'Slot updated successfully')
  @Response(404, 'Slot not found')
  public async updateSlot(
    @Path() slotId: string,
    @Body() requestBody: UpdateSlotRequest
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.updateSlot(slotId, requestBody);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update slot'
      };
    }
  }

  /**
   * Auto-assign slot
   * @summary Automatically assign best available slot for vehicle type
   */
  @Post('/auto-assign')
  @SuccessResponse(200, 'Slot assigned successfully')
  @Response(404, 'No available slots for vehicle type')
  public async autoAssignSlot(@Body() requestBody: AutoAssignRequest): Promise<AutoAssignResponse> {
    try {
      const result = await slotService.autoAssignSlot(requestBody.vehicleType);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to auto-assign slot'
      };
    }
  }

  /**
   * Set slot to maintenance
   * @summary Mark slot as under maintenance
   */
  @Post('/{slotId}/maintenance')
  @SuccessResponse(200, 'Slot marked for maintenance')
  @Response(400, 'Slot is currently occupied')
  public async setSlotMaintenance(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const result = await slotService.setSlotMaintenance(slotId);
      if (!result.success) {
        this.setStatus(400);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to set maintenance status'
      };
    }
  }

  /**
   * Release slot from maintenance
   * @summary Mark slot as available after maintenance
   */
  @Post('/{slotId}/release-maintenance')
  @SuccessResponse(200, 'Slot released from maintenance')
  @Response(404, 'Slot not found')
  public async releaseSlotMaintenance(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const result = await slotService.releaseSlotMaintenance(slotId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to release maintenance status'
      };
    }
  }

  /**
   * Reserve slot for manual assignment
   * @summary Reserve a specific slot for manual assignment with row locking
   */
  @Post('/{slotId}/reserve')
  @SuccessResponse(200, 'Slot reserved successfully')
  @Response(409, 'Slot no longer available')
  public async reserveSlot(@Path() slotId: string): Promise<SlotResponse> {
    try {
      const result = await slotService.reserveSlotForAssignment(slotId);
      if (!result.success) {
        this.setStatus(409);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reserve slot'
      };
    }
  }


  /**
   * Bulk create slots
   * @summary Create multiple slots at once
   */
  @Post('/bulk')
  @SuccessResponse(201, 'Slots created successfully')
  @Response(400, 'Invalid request or duplicate slot numbers')
  public async bulkCreateSlots(
    @Body() requestBody: CreateSlotRequest[]
  ): Promise<SlotResponse> {
    try {
      const result = await slotService.bulkCreateSlots(requestBody);
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
        message: error instanceof Error ? error.message : 'Failed to create slots'
      };
    }
  }
}