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
  Query
} from 'tsoa';
import { subscriptionService } from '../services/subscriptionService';

interface SubscriptionResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface CreateSubscriptionRequest {
  userId: string;
  tier: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  durationMonths?: number;
}

interface AddPointsRequest {
  amountSpent: number;
}

interface RedeemPointsRequest {
  points: number;
}

@Route('api/subscriptions')
@Tags('Subscriptions & Loyalty')
export class SubscriptionController extends Controller {

  /**
   * Create subscription
   * @summary Create a new subscription for a user with a selected tier and duration
   */
  @Post('/')
  @SuccessResponse(201, 'Subscription created')
  @Response(400, 'Invalid request')
  public async createSubscription(@Body() requestBody: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const result = await subscriptionService.createSubscription(
        requestBody.userId,
        requestBody.tier as any,
        requestBody.durationMonths || 1
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
        message: error instanceof Error ? error.message : 'Failed to create subscription'
      };
    }
  }

  /**
   * Get user's subscription
   * @summary Get the active subscription details for a specific user
   */
  @Get('/{userId}')
  @SuccessResponse(200, 'Subscription retrieved')
  @Response(404, 'No active subscription')
  public async getSubscription(@Path() userId: string): Promise<SubscriptionResponse> {
    try {
      const result = await subscriptionService.getSubscription(userId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get subscription'
      };
    }
  }

  /**
   * Add loyalty points
   * @summary Add loyalty points based on amount spent during a parking session
   */
  @Post('/{userId}/points/add')
  @SuccessResponse(200, 'Points added')
  public async addPoints(
    @Path() userId: string,
    @Body() requestBody: AddPointsRequest
  ): Promise<SubscriptionResponse> {
    try {
      const result = await subscriptionService.addLoyaltyPoints(userId, requestBody.amountSpent);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add points'
      };
    }
  }

  /**
   * Redeem loyalty points
   * @summary Redeem loyalty points for a discount on future parking
   */
  @Post('/{userId}/points/redeem')
  @SuccessResponse(200, 'Points redeemed')
  @Response(400, 'Insufficient points')
  public async redeemPoints(
    @Path() userId: string,
    @Body() requestBody: RedeemPointsRequest
  ): Promise<SubscriptionResponse> {
    try {
      const result = await subscriptionService.redeemPoints(userId, requestBody.points);
      if (!result.success) {
        this.setStatus(400);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to redeem points'
      };
    }
  }

  /**
   * Get available tiers
   * @summary Get all subscription tiers with their benefits, pricing, and perks
   */
  @Get('/tiers/all')
  @SuccessResponse(200, 'Tiers retrieved')
  public async getTiers(): Promise<SubscriptionResponse> {
    try {
      const tiers = subscriptionService.getTierBenefits();
      return {
        success: true,
        data: { tiers }
      };
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get tiers'
      };
    }
  }

  /**
   * Cancel subscription
   * @summary Cancel a user's active subscription
   */
  @Delete('/{userId}')
  @SuccessResponse(200, 'Subscription cancelled')
  @Response(404, 'No active subscription')
  public async cancelSubscription(@Path() userId: string): Promise<SubscriptionResponse> {
    try {
      const result = await subscriptionService.cancelSubscription(userId);
      if (!result.success) {
        this.setStatus(404);
      }
      return result;
    } catch (error) {
      this.setStatus(500);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel subscription'
      };
    }
  }
}
