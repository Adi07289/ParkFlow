import api from './api-client';

export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
}

export interface UpdateUserRequest {
  email?: string;
}

export const userApi = {
  // Get all users
  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Create a new user
  createUser: async (data: CreateUserRequest): Promise<UserResponse> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // Update user by ID
  updateUser: async (userId: string, data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  },

  // Delete user by ID
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};
