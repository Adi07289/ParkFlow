"use client";

import { AxiosError } from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi, AuthUser } from '@/lib/auth-api';
import { toast } from 'sonner';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, otp: string) => Promise<boolean>;
  register: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await authApi.getCurrentUser();
      setUser(response.success && response.user ? response.user : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resolve the current user once on mount (and on explicit refreshUser).
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle auth-based redirects off the resolved state, without refetching on
  // every navigation.
  useEffect(() => {
    if (loading || !pathname) return;

    if (user && pathname.startsWith('/auth/')) {
      router.replace('/dashboard');
      return;
    }

    if (!user && isProtectedPath(pathname)) {
      router.replace('/auth/login');
    }
  }, [loading, pathname, router, user]);

  const login = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authApi.verifyLoginOTP(email, otp);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success(response.message || 'Login successful!');
        return true;
      } else {
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Login failed');
      toast.error(message);
      return false;
    }
  };

  const register = async (email: string, otp: string): Promise<boolean> => {
    try {
      const response = await authApi.verifyRegisterOTP(email, otp);
      if (response.success && response.user) {
        setUser(response.user);
        toast.success(response.message || 'Registration successful!');
        return true;
      } else {
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Registration failed');
      toast.error(message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    toast.success('Logged out successfully');
    router.push('/auth/login');
  };

  const refreshUser = async (): Promise<void> => {
    await checkAuth();
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

function isProtectedPath(pathname: string): boolean {
  if (pathname === '/' || pathname.startsWith('/auth')) {
    return false;
  }

  return [
    '/dashboard',
    '/parking',
    '/analytics',
    '/alerts',
    '/maintenance',
    '/ev-charging',
    '/subscriptions',
    '/swaps',
    '/users',
  ].some((route) => pathname.startsWith(route));
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || fallback;
  }

  return fallback;
}
