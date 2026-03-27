import {
  Controller,
  Get,
  Route,
  Tags,
  Response,
  SuccessResponse,
  Path
} from 'tsoa';
import { signageService, SignageFeedResponse, SignageAreaAvailability, SignageDirectionalMessage } from '../services/signageService';

interface SignageResponse {
  success: boolean;
  message?: string;
  data?: any;
}

@Route('api/signage')
@Tags('Digital Signage')
export class SignageController extends Controller {

  /**
   * Get full availability feed for digital signage
   * @summary Returns real-time, per-level availability data for all digital signage displays. No authentication required — designed for public signage hardware polling.
   */
  @Get('/availability')
  @SuccessResponse(200, 'Availability feed retrieved successfully')
  public async getAvailabilityFeed(): Promise<SignageResponse> {
    try {
      const feed = await signageService.getAvailabilityFeed();
      return {
        success: true,
        data: feed
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve signage feed'
      };
    }
  }

  /**
   * Get availability for a specific area/level
   * @summary Returns availability data for a single area/level, suitable for level-specific signage displays.
   */
  @Get('/availability/{areaId}')
  @SuccessResponse(200, 'Area availability retrieved successfully')
  @Response(404, 'Area not found')
  public async getAreaAvailability(@Path() areaId: string): Promise<SignageResponse> {
    try {
      const area = await signageService.getAreaAvailability(areaId);
      if (!area) {
        this.setStatus(404);
        return {
          success: false,
          message: `Area '${areaId}' not found`
        };
      }
      return {
        success: true,
        data: area
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve area availability'
      };
    }
  }

  /**
   * Get directional message for entrance signage
   * @summary Returns a human-readable directional message with traffic guidance for entrance display boards.
   */
  @Get('/message')
  @SuccessResponse(200, 'Directional message retrieved successfully')
  public async getDirectionalMessage(): Promise<SignageResponse> {
    try {
      const message = await signageService.getDirectionalMessage();
      return {
        success: true,
        data: message
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve directional message'
      };
    }
  }
}
