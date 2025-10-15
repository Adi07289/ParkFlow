import {
  Controller,
  Get,
  Route,
  Tags,
  Response,
  SuccessResponse
} from 'tsoa';
import { VehicleType, SlotType, SlotStatus, SessionStatus, BillingType } from '@prisma/client';

interface EnumResponse {
  success: boolean;
  data: Record<string, string[]>;
}

interface ConfigResponse {
  success: boolean;
  data: {
    enums: {
      vehicleTypes: string[];
      slotTypes: string[];
      slotStatuses: string[];
      sessionStatuses: string[];
      billingTypes: string[];
    };
    systemConfig: {
      apiVersion: string;
      defaultBillingType: string;
      supportedFeatures: string[];
    };
  };
}

@Route('api/system')
@Tags('System')
export class SystemController extends Controller {

  /**
   * Get all system enum values
   * @summary Get all enum values used in the system
   */
  @Get('/enums')
  @SuccessResponse(200, 'Enum values retrieved successfully')
  public async getEnums(): Promise<EnumResponse> {
    const enums = {
      vehicleTypes: Object.values(VehicleType),
      slotTypes: Object.values(SlotType),
      slotStatuses: Object.values(SlotStatus),
      sessionStatuses: Object.values(SessionStatus),
      billingTypes: Object.values(BillingType)
    };

    return {
      success: true,
      data: enums
    };
  }

  /**
   * Get system configuration
   * @summary Get complete system configuration including enums and features
   */
  @Get('/config')
  @SuccessResponse(200, 'System configuration retrieved successfully')
  public async getSystemConfig(): Promise<ConfigResponse> {
    const config = {
      enums: {
        vehicleTypes: Object.values(VehicleType),
        slotTypes: Object.values(SlotType),
        slotStatuses: Object.values(SlotStatus),
        sessionStatuses: Object.values(SessionStatus),
        billingTypes: Object.values(BillingType)
      },
      systemConfig: {
        apiVersion: '1.0.0',
        defaultBillingType: BillingType.HOURLY,
        supportedFeatures: [
          'vehicle-entry',
          'auto-slot-assignment',
          'manual-slot-override',
          'maintenance-mode',
          'real-time-dashboard',
          'vehicle-search',
          'billing-calculation'
        ]
      }
    };

    return {
      success: true,
      data: config
    };
  }

  /**
   * Get vehicle types
   * @summary Get all supported vehicle types
   */
  @Get('/vehicle-types')
  @SuccessResponse(200, 'Vehicle types retrieved successfully')
  public async getVehicleTypes(): Promise<{ success: boolean; data: string[] }> {
    return {
      success: true,
      data: Object.values(VehicleType)
    };
  }

  /**
   * Get slot types
   * @summary Get all supported slot types
   */
  @Get('/slot-types')
  @SuccessResponse(200, 'Slot types retrieved successfully')
  public async getSlotTypes(): Promise<{ success: boolean; data: string[] }> {
    return {
      success: true,
      data: Object.values(SlotType)
    };
  }

  /**
   * Get billing types
   * @summary Get all supported billing types
   */
  @Get('/billing-types')
  @SuccessResponse(200, 'Billing types retrieved successfully')
  public async getBillingTypes(): Promise<{ success: boolean; data: string[] }> {
    return {
      success: true,
      data: Object.values(BillingType)
    };
  }
}