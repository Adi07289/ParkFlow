import api from './api-client';

export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
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
