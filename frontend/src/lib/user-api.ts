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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);