import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Route,
  Tags,
  Response,
  SuccessResponse
} from 'tsoa';
import { UserService } from '../services/userService';
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '../types/user.types';

@Route('api/users')
@Tags('Users')
export class UserController extends Controller {
  private userService = new UserService();

  /**
   * Get all users
   * @summary Retrieve all users
   */
  @Get('/')
  @SuccessResponse(200, 'Users retrieved successfully')
  public async getUsers(): Promise<UserResponse[]> {
    const users = await this.userService.getAllUsers();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }));
  }

  /**
   * Get user by ID
   * @summary Retrieve a specific user
   * @param userId The user's identifier
   */
  @Get('{userId}')
  @SuccessResponse(200, 'User retrieved successfully')
  @Response(404, 'User not found')
  public async getUser(@Path() userId: string): Promise<UserResponse> {
    const user = await this.userService.getUserById(userId);
    
    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  /**
   * Create a new user
   * @summary Create a new user
   */
  @Post('/')
  @SuccessResponse(201, 'User created successfully')
  @Response(400, 'Invalid input or user already exists')
  public async createUser(@Body() requestBody: CreateUserRequest): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await this.userService.getUserByEmail(requestBody.email);
    if (existingUser) {
      this.setStatus(400);
      throw new Error('User with this email already exists');
    }

    const user = await this.userService.createUser(requestBody);
    this.setStatus(201);

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  /**
   * Update user by ID
   * @summary Update a specific user
   * @param userId The user's identifier
   */
  @Put('{userId}')
  @SuccessResponse(200, 'User updated successfully')
  @Response(404, 'User not found')
  @Response(400, 'Invalid input or email already exists')
  public async updateUser(
    @Path() userId: string,
    @Body() requestBody: UpdateUserRequest
  ): Promise<UserResponse> {
    // Check if email is being updated and already exists
    if (requestBody.email) {
      const existingUser = await this.userService.getUserByEmail(requestBody.email);
      if (existingUser && existingUser.id !== userId) {
        this.setStatus(400);
        throw new Error('User with this email already exists');
      }
    }

    const user = await this.userService.updateUser(userId, requestBody);
    
    if (!user) {
      this.setStatus(404);
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    };
  }

  /**
   * Delete user by ID
   * @summary Delete a specific user
   * @param userId The user's identifier
   */
  @Delete('{userId}')
  @SuccessResponse(204, 'User deleted successfully')
  @Response(404, 'User not found')
  public async deleteUser(@Path() userId: string): Promise<void> {
    const deleted = await this.userService.deleteUser(userId);
    
    if (!deleted) {
      this.setStatus(404);
      throw new Error('User not found');
    }

    this.setStatus(204);
  }
}