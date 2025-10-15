"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { billingApi, BillingRates } from '@/lib/billing-api';
import { 
  Clock, 
  Calendar, 
  IndianRupee,
  RefreshCw,
  Info,
  CheckCircle,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export function BillingRatesComponent() {
  const [billingRates, setBillingRates] = useState<BillingRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBillingRates();
  }, []);

  const fetchBillingRates = async () => {
    try {
      setIsLoading(true);
      const rates = await billingApi.getBillingRates();
      setBillingRates(rates);
    } catch (error) {
      console.error('Failed to fetch billing rates:', error);
      toast.error('Failed to load billing rates');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!billingRates) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p>Unable to load billing rates</p>
            <Button variant="outline" onClick={fetchBillingRates} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
                Billing & Pricing
              </CardTitle>
              <CardDescription>
                Current parking rates and billing configuration
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchBillingRates}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hourly Rates */}
            <div>
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-semibold">Hourly Parking</h3>
              </div>
              <div className="space-y-3">
                {billingRates.hourlyRates.map((rate, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {rate.duration}
                        </Badge>
                        <span className="text-lg font-bold text-blue-600">₹{rate.rate}</span>
                      </div>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600">{rate.description}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center text-blue-800 mb-1">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="font-medium">Hourly Billing Rules</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Charges calculated on exit based on total duration</li>
                  <li>• Partial hours are rounded up to the next hour</li>
                  <li>• Maximum daily rate applies after 6+ hours</li>
                  <li>• Payment processed at time of exit</li>
                </ul>
              </div>
            </div>

            {/* Day Pass */}
            <div>
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                <h3 className="text-lg font-semibold">Day Pass Parking</h3>
              </div>
              
              <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    ₹{billingRates.dayPass.rate}
                  </div>
                  <Badge className="bg-green-500 text-white mb-3">
                    Day Pass
                  </Badge>
                  <p className="text-green-800 font-medium mb-4">
                    {billingRates.dayPass.description}
                  </p>
                  
                  <div className="flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">Best Value for Long Stays</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center text-green-800 mb-1">
                  <Info className="h-4 w-4 mr-2" />
                  <span className="font-medium">Day Pass Benefits</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Flat fee collected at entry</li>
                  <li>• No additional charges on exit</li>
                  <li>• Valid until mall closes</li>
                  <li>• Perfect for shopping & leisure</li>
                  <li>• Duration tracked for reporting only</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Comparison</CardTitle>
          <CardDescription>
            Choose the best billing option based on your parking duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Duration</th>
                  <th className="text-center p-3 font-medium">Hourly Rate</th>
                  <th className="text-center p-3 font-medium">Day Pass</th>
                  <th className="text-center p-3 font-medium">Best Choice</th>
                </tr>
              </thead>
              <tbody>
                {billingRates.hourlyRates.map((rate, index) => {
                  const dayPassRate = billingRates.dayPass.rate;
                  const isBetter = rate.rate < dayPassRate;
                  const savings = dayPassRate - rate.rate;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <Badge variant="outline">{rate.duration}</Badge>
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-medium ${isBetter ? 'text-blue-600' : 'text-gray-600'}`}>
                          ₹{rate.rate}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <span className={`font-medium ${!isBetter ? 'text-green-600' : 'text-gray-600'}`}>
                          ₹{dayPassRate}
                        </span>
                      </td>
                      <td className="text-center p-3">
                        {isBetter ? (
                          <Badge className="bg-blue-500 text-white">
                            Hourly (Save ₹{Math.abs(savings)})
                          </Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">
                            Day Pass (Save ₹{savings})
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-600" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Payment & Processing</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All rates are in Indian Rupees (₹)</li>
                <li>• Payment processed automatically on exit</li>
                <li>• Digital receipts available for all transactions</li>
                <li>• GST included in all displayed rates</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Slot Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Slots automatically freed after exit processing</li>
                <li>• Real-time availability tracking</li>
                <li>• Automated billing calculation</li>
                <li>• Duration tracking for all billing types</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}