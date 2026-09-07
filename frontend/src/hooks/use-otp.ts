"use client";

import { AxiosError } from 'axios';
import { useState } from 'react';
import { authApi, SendOTPResponse } from '@/lib/auth-api';
import { toast } from 'sonner';

interface UseOTPReturn {
  sendingOTP: boolean;
  otpSent: boolean;
  cooldown: number;
  sendOTP: (email: string, type: 'register' | 'login') => Promise<void>;
  resetOTP: () => void;
}

export function useOTP(): UseOTPReturn {
  const [sendingOTP, setSendingOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendOTP = async (email: string, type: 'register' | 'login') => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before requesting another OTP`);
      return;
    }

    try {
      setSendingOTP(true);
      let response: SendOTPResponse;
      
      if (type === 'register') {
        response = await authApi.sendRegisterOTP(email);
      } else {
        response = await authApi.sendLoginOTP(email);
      }

      if (response.success) {
        setOtpSent(true);
        toast.success(response.message || 'OTP sent successfully!');
        
        // Start cooldown timer
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error: unknown) {
      const message =
        error instanceof AxiosError ? error.response?.data?.message || 'Failed to send OTP' : 'Failed to send OTP';
      toast.error(message);
    } finally {
      setSendingOTP(false);
    }
  };

  const resetOTP = () => {
    setOtpSent(false);
    setCooldown(0);
  };

  return {
    sendingOTP,
    otpSent,
    cooldown,
    sendOTP,
    resetOTP,
  };
}
