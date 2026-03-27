import { PrismaClient } from '@prisma/client';
import jwt, { SignOptions } from 'jsonwebtoken';
import { createClient } from 'redis';
import { SendOTPResponse, VerifyOTPResponse, AuthUser, JWTPayload } from '../types/auth.types';

const prisma = new PrismaClient();
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Initialize Redis connection
redis.connect().catch(console.error);

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private readonly OTP_EXPIRY = 300; // 5 minutes

  async sendRegisterOTP(email: string): Promise<SendOTPResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email',
          otp: ''
        };
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in Redis
      const otpKey = `otp:register:${email}`;
      await redis.setEx(otpKey, this.OTP_EXPIRY, otp);

      return {
        success: true,
        message: 'OTP sent successfully',
        otp: otp // Always return for frontend display
      };
    } catch (error) {
      console.error('Error sending register OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        otp: ''
      };
    }
  }

  async verifyRegisterOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists with this email'
        };
      }

      // Verify OTP
      const otpKey = `otp:register:${email}`;
      const storedOTP = await redis.get(otpKey);

      if (!storedOTP || storedOTP !== otp) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email
        }
      });

      // Delete OTP after successful verification
      await redis.del(otpKey);

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('Error verifying register OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  async sendLoginOTP(email: string): Promise<SendOTPResponse> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found with this email',
          otp: ''
        };
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in Redis
      const otpKey = `otp:login:${email}`;
      await redis.setEx(otpKey, this.OTP_EXPIRY, otp);

      return {
        success: true,
        message: 'OTP sent successfully',
        otp: otp // Always return for frontend display
      };
    } catch (error) {
      console.error('Error sending login OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP',
        otp: ''
      };
    }
  }

  async verifyLoginOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found with this email'
        };
      }

      // Verify OTP
      const otpKey = `otp:login:${email}`;
      const storedOTP = await redis.get(otpKey);

      if (!storedOTP || storedOTP !== otp) {
        return {
          success: false,
          message: 'Invalid or expired OTP'
        };
      }

      // Delete OTP after successful verification
      await redis.del(otpKey);

      // Generate JWT token
      const token = this.generateToken(user.id, user.email);

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('Error verifying login OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt
      };
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  generateToken(userId: string, email: string): string {
    const payload: JWTPayload = {
      userId,
      email
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN
    } as SignOptions);
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();