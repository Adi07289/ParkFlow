"use client";

import { AxiosError } from 'axios';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation } from '@/components/navigation';
import { subscriptionApi, TierBenefits, SubscriptionData } from '@/lib/subscription-api';
import { userApi, UserResponse } from '@/lib/user-api';
import { useAuth } from '@/contexts/auth-context';
import {
  Crown,
  Star,
  Gift,
  Award,
  Sparkles,
  Percent,
  Clock,
  CheckCircle
} from 'lucide-react';

function SubscriptionPageContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [tiers, setTiers] = useState<TierBenefits[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userIdInput, setUserIdInput] = useState('');
  const [lookupUserId, setLookupUserId] = useState('');
  const [redeemPoints, setRedeemPoints] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTiers = useCallback(async () => {
    try {
      const tierData = await subscriptionApi.getTiers();
      setTiers(tierData);
    } catch (error) {
      console.error('Failed to fetch tiers:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const userData = await userApi.getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchSubscription = useCallback(async (userId: string) => {
    try {
      const data = await subscriptionApi.getSubscription(userId);
      setSubscription(data);
    } catch {
      setSubscription(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchTiers(), fetchUsers()]);
      setIsLoading(false);
    };
    init();
  }, [fetchTiers, fetchUsers]);

  useEffect(() => {
    const queryUserId = searchParams.get('userId')?.trim();

    if (queryUserId) {
      setUserIdInput(queryUserId);
      setLookupUserId(queryUserId);
      fetchSubscription(queryUserId);
      return;
    }

    if (user?.id && !lookupUserId && !userIdInput) {
      setUserIdInput(user.id);
      setLookupUserId(user.id);
      fetchSubscription(user.id);
    }
  }, [fetchSubscription, lookupUserId, searchParams, user?.id, userIdInput]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleLookup = async () => {
    if (!userIdInput.trim()) return;
    setLookupUserId(userIdInput.trim());
    await fetchSubscription(userIdInput.trim());
  };

  const handleSubscribe = async (tier: string) => {
    if (!lookupUserId) {
      showMessage('error', 'Please look up a user first');
      return;
    }
    try {
      const result = await subscriptionApi.createSubscription(lookupUserId, tier, 1);
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) fetchSubscription(lookupUserId);
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to subscribe'));
    }
  };

  const handleRedeem = async () => {
    if (!lookupUserId || !redeemPoints) return;
    try {
      const result = await subscriptionApi.redeemPoints(lookupUserId, parseInt(redeemPoints));
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) {
        setRedeemPoints('');
        fetchSubscription(lookupUserId);
      }
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to redeem'));
    }
  };

  const handleCancel = async () => {
    if (!lookupUserId) return;
    try {
      const result = await subscriptionApi.cancelSubscription(lookupUserId);
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) setSubscription(null);
    } catch (error: unknown) {
      showMessage('error', getErrorMessage(error, 'Failed to cancel'));
    }
  };

  const selectedUser = users.find((candidate) => candidate.id === lookupUserId);
  const suggestedUsers = users.filter((candidate) => {
    const query = userIdInput.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      candidate.email.toLowerCase().includes(query) ||
      candidate.id.toLowerCase().includes(query)
    );
  }).slice(0, 6);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BASIC': return 'bg-gray-100 border-gray-300 text-gray-800';
      case 'PREMIUM': return 'bg-purple-50 border-purple-300 text-purple-800';
      case 'ENTERPRISE': return 'bg-amber-50 border-amber-300 text-amber-800';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BASIC': return Star;
      case 'PREMIUM': return Award;
      case 'ENTERPRISE': return Crown;
      default: return Star;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Crown className="h-8 w-8 mr-2 text-purple-600" />
                Subscriptions & Loyalty
              </h1>
              <p className="text-gray-600 mt-1">Manage subscription tiers, loyalty points, and member benefits</p>
            </div>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div className={`mb-4 p-4 rounded-lg ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {actionMessage.text}
            </div>
          )}

          {/* User Lookup */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Look Up User Subscription</CardTitle>
              <CardDescription>
                Select a real user record below or paste an ID if you already have one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by user email or ID"
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                />
                <Button onClick={handleLookup}>Look Up</Button>
              </div>

              {selectedUser && (
                <div className="rounded-lg border bg-purple-50 p-3 text-sm text-purple-900">
                  Selected user: <span className="font-semibold">{selectedUser.email}</span>
                  <span className="ml-2 font-mono text-xs">{selectedUser.id}</span>
                </div>
              )}

              {suggestedUsers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Quick select</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {suggestedUsers.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={async () => {
                          setUserIdInput(candidate.id);
                          setLookupUserId(candidate.id);
                          await fetchSubscription(candidate.id);
                        }}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          lookupUserId === candidate.id
                            ? 'border-purple-400 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{candidate.email}</div>
                        <div className="font-mono text-xs text-gray-500">{candidate.id}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Subscription */}
          {subscription && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Active Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-purple-700">Tier</div>
                    <div className="text-2xl font-bold text-purple-900">{subscription.tier}</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-700 flex items-center"><Star className="h-3 w-3 mr-1" /> Points</div>
                    <div className="text-2xl font-bold text-blue-900">{subscription.loyaltyPoints}</div>
                    <div className="text-xs text-blue-600">Worth ₹{subscription.redeemableAmount}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-700 flex items-center"><Percent className="h-3 w-3 mr-1" /> Discount</div>
                    <div className="text-2xl font-bold text-green-900">{subscription.benefits.discountPercent}%</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-orange-700 flex items-center"><Clock className="h-3 w-3 mr-1" /> Remaining</div>
                    <div className="text-2xl font-bold text-orange-900">{subscription.daysRemaining}d</div>
                  </div>
                </div>

                {/* Redeem & Cancel */}
                <div className="flex gap-2 mt-4">
                  <Input
                    placeholder="Points to redeem"
                    type="number"
                    value={redeemPoints}
                    onChange={(e) => setRedeemPoints(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button onClick={handleRedeem} variant="outline" size="sm">
                    <Gift className="h-4 w-4 mr-1" /> Redeem
                  </Button>
                  <Button onClick={handleCancel} variant="destructive" size="sm" className="ml-auto">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tier Cards */}
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier) => {
              const Icon = getTierIcon(tier.tier);
              return (
                <Card key={tier.tier} className={`border-2 ${getTierColor(tier.tier)}`}>
                  <CardHeader className="text-center">
                    <Icon className="h-10 w-10 mx-auto mb-2" />
                    <CardTitle>{tier.tier}</CardTitle>
                    <CardDescription className="text-lg font-semibold">
                      ₹{tier.monthlyPrice}/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        {tier.discountPercent}% off all parking
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        {tier.pointsMultiplier}x loyalty points
                      </li>
                      <li className="flex items-center text-sm">
                        {tier.priorityBooking ? (
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        ) : (
                          <span className="h-4 w-4 mr-2 inline-block text-center text-gray-400">—</span>
                        )}
                        Priority booking
                      </li>
                    </ul>
                    <p className="text-xs text-gray-600 mb-4">{tier.description}</p>
                    <Button
                      onClick={() => handleSubscribe(tier.tier)}
                      className="w-full"
                      disabled={subscription?.tier === tier.tier}
                    >
                      {subscription?.tier === tier.tier ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

function SubscriptionsPageFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
}

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsPageFallback />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
