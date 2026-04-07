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
  Body,
  Request
} from 'tsoa';
import { reservationSwapService } from '../services/reservationSwapService';
import { AuthRequest } from '../middleware/authMiddleware';

interface SwapResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface ListSwapRequest {
  sessionId: string;
  listingPrice: number;
}

@Route('api/swaps')
@Tags('Reservation Swaps')
export class SwapController extends Controller {

  /**
   * List reservation for swap
   * @summary List a parking reservation on the secondary market for another user to claim
   */
  @Post('/')
  @SuccessResponse(201, 'Listing created')
  @Response(400, 'Invalid request')
  public async listForSwap(
    @Body() requestBody: ListSwapRequest,
    @Request() request: AuthRequest
  ): Promise<SwapResponse> {
    try {
      const authenticatedUserId = request.user?.userId;

      if (!authenticatedUserId) {
        this.setStatus(401);
        return { success: false, message: 'Authentication required' };
      }

      const result = await reservationSwapService.listForSwap(
        authenticatedUserId,
        requestBody.sessionId,
        requestBody.listingPrice
      );
      if (result.success) {
        this.setStatus(201);
      } else {
        this.setStatus(400);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to list for swap'
      };
    }
  }

  /**
   * Get available swaps
   * @summary Browse all available reservation swap listings on the secondary market
   */
  @Get('/')
  @SuccessResponse(200, 'Swaps retrieved')
  public async getAvailableSwaps(): Promise<SwapResponse> {
    try {
      const swaps = await reservationSwapService.getAvailableSwaps();
      return {
        success: true,
        data: {
          swaps,
          totalListings: swaps.length
        }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve swaps'
      };
    }
  }

  /**
   * Claim a swap
   * @summary Claim an available reservation swap listing
   */
  @Post('/{swapId}/claim')
  @SuccessResponse(200, 'Swap claimed')
  @Response(404, 'Swap not found')
  @Response(400, 'Cannot claim swap')
  public async claimSwap(
    @Path() swapId: string,
    @Request() request: AuthRequest
  ): Promise<SwapResponse> {
    try {
      const authenticatedUserId = request.user?.userId;

      if (!authenticatedUserId) {
        this.setStatus(401);
        return { success: false, message: 'Authentication required' };
      }

      const result = await reservationSwapService.claimSwap(swapId, authenticatedUserId);
      if (!result.success) {
        this.setStatus(result.message.includes('not found') || result.message.includes('expired') ? 404 : 400);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to claim swap'
      };
    }
  }

  /**
   * Cancel a swap listing
   * @summary Cancel your own reservation swap listing
   */
  @Delete('/{swapId}')
  @SuccessResponse(200, 'Listing cancelled')
  @Response(404, 'Listing not found')
  public async cancelListing(
    @Path() swapId: string,
    @Request() request: AuthRequest
  ): Promise<SwapResponse> {
    try {
      const authenticatedUserId = request.user?.userId;

      if (!authenticatedUserId) {
        this.setStatus(401);
        return { success: false, message: 'Authentication required' };
      }

      const result = await reservationSwapService.cancelListing(swapId, authenticatedUserId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel listing'
      };
    }
  }

  /**
   * Get user swap history
   * @summary Get all swap listings and claims for a specific user
   */
  @Get('/history/me')
  @SuccessResponse(200, 'History retrieved')
  public async getUserHistory(@Request() request: AuthRequest): Promise<SwapResponse> {
    try {
      const authenticatedUserId = request.user?.userId;

      if (!authenticatedUserId) {
        this.setStatus(401);
        return { success: false, message: 'Authentication required' };
      }

      const history = await reservationSwapService.getUserSwapHistory(authenticatedUserId);
      return {
        success: true,
        data: { history, total: history.length }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve history'
      };
    }
  }
}
