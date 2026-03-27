import { PrismaClient } from '@prisma/client';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface TierBenefits {
  tier: SubscriptionTier;
  discountPercent: number;
  priorityBooking: boolean;
  pointsMultiplier: number;
  monthlyPrice: number;
  description: string;
}

class SubscriptionService {
  // Tier configuration
  private readonly TIER_BENEFITS: Record<SubscriptionTier, TierBenefits> = {
    BASIC: {
      tier: SubscriptionTier.BASIC,
      discountPercent: 5,
      priorityBooking: false,
      pointsMultiplier: 1,
      monthlyPrice: 299,
      description: '5% discount on all parking, 1x loyalty points'
    },
    PREMIUM: {
      tier: SubscriptionTier.PREMIUM,
      discountPercent: 15,
      priorityBooking: true,
      pointsMultiplier: 2,
      monthlyPrice: 799,
      description: '15% discount, priority booking, 2x loyalty points'
    },
    ENTERPRISE: {
      tier: SubscriptionTier.ENTERPRISE,
      discountPercent: 25,
      priorityBooking: true,
      pointsMultiplier: 3,
      monthlyPrice: 1999,
      description: '25% discount, priority booking, 3x loyalty points, dedicated support'
    }
  };

  private readonly POINTS_PER_RUPEE = 1; // 1 point per ₹1 spent
  private readonly POINTS_TO_RUPEE_REDEMPTION = 100; // 100 points = ₹1 discount

  /**
   * Create a new subscription
   */
  async createSubscription(
    userId: string,
    tier: SubscriptionTier,
    durationMonths: number = 1
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check for existing active subscription
      const existing = await prisma.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE }
      });
      if (existing) {
        return { success: false, message: 'User already has an active subscription. Cancel or upgrade it first.' };
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const subscription = await prisma.subscription.create({
        data: {
          userId,
          tier,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
          loyaltyPoints: 0,
          totalSpent: 0
        }
      });

      return {
        success: true,
        message: `${tier} subscription created for ${durationMonths} month(s)`,
        data: {
          subscriptionId: subscription.id,
          tier: subscription.tier,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          benefits: this.TIER_BENEFITS[tier]
        }
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Get user's subscription details
   */
  async getSubscription(userId: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE },
        include: { user: true }
      });

      if (!subscription) {
        return { success: false, message: 'No active subscription found' };
      }

      // Check expiry
      if (new Date() > subscription.endDate) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.EXPIRED }
        });
        return { success: false, message: 'Subscription has expired' };
      }

      const daysRemaining = Math.ceil(
        (subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        success: true,
        message: 'Subscription found',
        data: {
          id: subscription.id,
          tier: subscription.tier,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          daysRemaining,
          loyaltyPoints: subscription.loyaltyPoints,
          totalSpent: subscription.totalSpent,
          benefits: this.TIER_BENEFITS[subscription.tier],
          pointRedemptionValue: `${this.POINTS_TO_RUPEE_REDEMPTION} points = ₹1`,
          redeemableAmount: Math.floor(subscription.loyaltyPoints / this.POINTS_TO_RUPEE_REDEMPTION)
        }
      };
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  }

  /**
   * Add loyalty points to user's subscription (called after session completion)
   */
  async addLoyaltyPoints(userId: string, amountSpent: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE }
      });

      if (!subscription) {
        return { success: false, message: 'No active subscription found' };
      }

      const benefits = this.TIER_BENEFITS[subscription.tier];
      const basePoints = Math.floor(amountSpent * this.POINTS_PER_RUPEE);
      const earnedPoints = basePoints * benefits.pointsMultiplier;

      const updated = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          loyaltyPoints: { increment: earnedPoints },
          totalSpent: { increment: amountSpent }
        }
      });

      return {
        success: true,
        message: `${earnedPoints} loyalty points added (${benefits.pointsMultiplier}x multiplier)`,
        data: {
          pointsEarned: earnedPoints,
          totalPoints: updated.loyaltyPoints,
          multiplier: benefits.pointsMultiplier,
          totalSpent: updated.totalSpent
        }
      };
    } catch (error) {
      console.error('Error adding loyalty points:', error);
      throw error;
    }
  }

  /**
   * Redeem loyalty points for a discount
   */
  async redeemPoints(userId: string, pointsToRedeem: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE }
      });

      if (!subscription) {
        return { success: false, message: 'No active subscription found' };
      }

      if (subscription.loyaltyPoints < pointsToRedeem) {
        return {
          success: false,
          message: `Insufficient points. Available: ${subscription.loyaltyPoints}, Requested: ${pointsToRedeem}`
        };
      }

      if (pointsToRedeem < this.POINTS_TO_RUPEE_REDEMPTION) {
        return {
          success: false,
          message: `Minimum ${this.POINTS_TO_RUPEE_REDEMPTION} points required for redemption`
        };
      }

      const discountAmount = Math.floor(pointsToRedeem / this.POINTS_TO_RUPEE_REDEMPTION);
      const actualPointsUsed = discountAmount * this.POINTS_TO_RUPEE_REDEMPTION;

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          loyaltyPoints: { decrement: actualPointsUsed }
        }
      });

      return {
        success: true,
        message: `Redeemed ${actualPointsUsed} points for ₹${discountAmount} discount`,
        data: {
          pointsRedeemed: actualPointsUsed,
          discountAmount,
          remainingPoints: subscription.loyaltyPoints - actualPointsUsed
        }
      };
    } catch (error) {
      console.error('Error redeeming points:', error);
      throw error;
    }
  }

  /**
   * Apply subscription-based discount to a billing amount
   */
  async applyDiscount(userId: string, amount: number): Promise<{
    originalAmount: number;
    discountPercent: number;
    discountAmount: number;
    finalAmount: number;
    hasSubscription: boolean;
  }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE }
      });

      if (!subscription || new Date() > subscription.endDate) {
        return {
          originalAmount: amount,
          discountPercent: 0,
          discountAmount: 0,
          finalAmount: amount,
          hasSubscription: false
        };
      }

      const benefits = this.TIER_BENEFITS[subscription.tier];
      const discountAmount = Math.round(amount * (benefits.discountPercent / 100));

      return {
        originalAmount: amount,
        discountPercent: benefits.discountPercent,
        discountAmount,
        finalAmount: amount - discountAmount,
        hasSubscription: true
      };
    } catch (error) {
      console.error('Error applying discount:', error);
      return {
        originalAmount: amount,
        discountPercent: 0,
        discountAmount: 0,
        finalAmount: amount,
        hasSubscription: false
      };
    }
  }

  /**
   * Get available subscription tiers and benefits
   */
  getTierBenefits(): TierBenefits[] {
    return Object.values(this.TIER_BENEFITS);
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await prisma.subscription.findFirst({
        where: { userId, status: SubscriptionStatus.ACTIVE }
      });

      if (!subscription) {
        return { success: false, message: 'No active subscription to cancel' };
      }

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.CANCELLED }
      });

      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }
}

export const subscriptionService = new SubscriptionService();
