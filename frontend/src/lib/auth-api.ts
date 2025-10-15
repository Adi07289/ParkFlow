import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8008/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  otp: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    createdAt: string;
  };
  token?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}

export const authApi = {
  // Send OTP for registration
  sendRegisterOTP: async (email: string): Promise<SendOTPResponse> => {
    const response = await api.post('/auth/send-register-otp', { email });
    return response.data;
  },

  // Verify OTP and register user
  verifyRegisterOTP: async (email: string, otp: string): Promise<VerifyOTPResponse> => {
    const response = await api.post('/auth/verify-register-otp', { email, otp });
    return response.data;
  },

  // Send OTP for login
  sendLoginOTP: async (email: string): Promise<SendOTPResponse> => {
    const response = await api.post('/auth/send-login-otp', { email });
    return response.data;
  },

  // Verify OTP and login user
  verifyLoginOTP: async (email: string, otp: string): Promise<VerifyOTPResponse> => {
    const response = await api.post('/auth/verify-login-otp', { email, otp });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the invalid token cookie
      if (typeof window !== 'undefined') {
        // Clear cookie by setting it with expired date
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
    return Promise.reject(error);
  }
);