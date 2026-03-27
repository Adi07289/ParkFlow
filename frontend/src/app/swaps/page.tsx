"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navigation } from '@/components/navigation';
import { swapApi, SwapListing } from '@/lib/swap-api';
import {
  ArrowLeftRight,
  RefreshCw,
  IndianRupee,
  Tag,
  Clock,
  MapPin,
  ShoppingCart,
  Check
} from 'lucide-react';

export default function SwapsPage() {
  const [swaps, setSwaps] = useState<SwapListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimUserId, setClaimUserId] = useState('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const swapData = await swapApi.getAvailableSwaps();
      setSwaps(swapData);
    } catch (error) {
      console.error('Failed to fetch swaps:', error);
      setSwaps([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleClaim = async (swapId: string) => {
    if (!claimUserId.trim()) {
      showMessage('error', 'Please enter your User ID to claim');
      return;
    }
    try {
      const result = await swapApi.claimSwap(swapId, claimUserId.trim());
      showMessage(result.success ? 'success' : 'error', result.message);
      if (result.success) fetchData();
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to claim');
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    if (diffMs <= 0) return 'Expired';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <ArrowLeftRight className="h-8 w-8 mr-2 text-blue-600" />
                Slot Swap Marketplace
              </h1>
              <p className="text-gray-600 mt-1">Browse and claim available reservation swaps</p>
            </div>
            <Button onClick={fetchData} className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Action Message */}
          {actionMessage && (
            <div className={`mb-4 p-4 rounded-lg ${actionMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {actionMessage.text}
            </div>
          )}

          {/* Claim User ID */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Your Identity</CardTitle>
              <CardDescription>Enter your User ID to claim swap listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Your User ID"
                value={claimUserId}
                onChange={(e) => setClaimUserId(e.target.value)}
                className="max-w-md"
              />
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Swaps</CardTitle>
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{swaps.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Savings</CardTitle>
                <IndianRupee className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₹{swaps.length > 0 ? Math.round(swaps.reduce((sum, s) => sum + s.savings, 0) / swaps.length) : 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Deal</CardTitle>
                <Tag className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  ₹{swaps.length > 0 ? Math.max(...swaps.map(s => s.savings)) : 0} off
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Swap Listings */}
          <Card>
            <CardHeader>
              <CardTitle>Available Listings</CardTitle>
              <CardDescription>{swaps.length} reservations available for swap</CardDescription>
            </CardHeader>
            <CardContent>
              {swaps.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ArrowLeftRight className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg">No swap listings available</p>
                  <p className="text-sm">Check back later for new listings</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {swaps.map((swap) => (
                    <div key={swap.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          <span className="font-bold">{swap.slotNumber}</span>
                        </div>
                        <Badge variant="outline">{swap.slotType}</Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 line-through">₹{swap.originalPrice}</span>
                          <span className="text-xl font-bold text-green-700">₹{swap.listingPrice}</span>
                        </div>
                        {swap.savings > 0 && (
                          <Badge variant="success" className="text-xs">
                            Save ₹{swap.savings}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires in {getTimeRemaining(swap.expiresAt)}
                      </div>

                      <Button
                        onClick={() => handleClaim(swap.id)}
                        className="w-full"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Claim This Spot
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
