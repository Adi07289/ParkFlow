import { PrismaClient, User } from '@prisma/client';
import { CreateUserRequest, UpdateUserRequest } from '../types/user.types';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Get all users
   */
  public async getAllUsers(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        id
      }
    });
  }

  /**
   * Create a new user
   */
  public async createUser(userData: CreateUserRequest): Promise<User> {
    return prisma.user.create({
      data: userData
    });
  }

  /**
   * Update user by ID
   */
  public async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    try {
      return await prisma.user.update({
        where: {
          id
        },
        data: userData
      });
    } catch (error) {
      // User not found
      return null;
    }
  }

  /**
   * Delete user by ID
   */
  public async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: {
          id
        }
      });
      return true;
    } catch (error) {
      // User not found
      return false;
    }
  }

  /**
   * Check if user exists by email
   */
  public async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: {
        email
      }
    });
  }
}