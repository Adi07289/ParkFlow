"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OTPInput } from '@/components/ui/otp-input';
import { useAuth } from '@/contexts/auth-context';
import { useOTP } from '@/hooks/use-otp';
import { Eye, Mail, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  const { login, loading } = useAuth();
  const { sendingOTP, otpSent, otp, cooldown, sendOTP, resetOTP } = useOTP();
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    setEmailError('');
    
    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    await sendOTP(email.toLowerCase().trim(), 'login');
  };

  const handleVerifyOTP = async () => {
    if (enteredOTP.length !== 6) {
      return;
    }

    setIsVerifying(true);
    try {
      const success = await login(email.toLowerCase().trim(), enteredOTP);
      if (success) {
        router.push('/dashboard');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOTPComplete = (otpValue: string) => {
    setEnteredOTP(otpValue);
    // Auto-submit when OTP is complete
    if (otpValue.length === 6) {
      handleVerifyOTP();
    }
  };

  const handleBack = () => {
    resetOTP();
    setEnteredOTP('');
    setEmailError('');
  };

  const handleResendOTP = async () => {
    if (cooldown === 0) {
      await sendOTP(email.toLowerCase().trim(), 'login');
      setEnteredOTP('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {!otpSent ? 'Enter your email' : 'Verify your email'}
            </CardTitle>
            <CardDescription className="text-center">
              {!otpSent
                ? 'We\'ll send you a 6-digit verification code'
                : `We've sent a 6-digit code to ${email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!otpSent ? (
              // Email input step
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={sendingOTP}
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOTP || !email.trim()}
                  className="w-full"
                >
                  {sendingOTP ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              </div>
            ) : (
              // OTP verification step
              <div className="space-y-6">
                {/* Display generated OTP for testing */}
                {otp && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Eye className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Your OTP:</strong>{' '}
                      <code className="font-mono text-lg bg-white px-2 py-1 rounded ml-2">
                        {otp}
                      </code>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <OTPInput
                    length={6}
                    value={enteredOTP}
                    onChange={setEnteredOTP}
                    onComplete={handleOTPComplete}
                    disabled={isVerifying}
                    className="justify-center"
                  />

                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={cooldown > 0 || sendingOTP}
                      className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {cooldown > 0
                        ? `Resend OTP in ${cooldown}s`
                        : sendingOTP
                        ? 'Sending...'
                        : 'Resend OTP'
                      }
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isVerifying}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleVerifyOTP}
                    disabled={enteredOTP.length !== 6 || isVerifying}
                    className="flex-1"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}