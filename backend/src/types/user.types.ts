export interface CreateUserRequest {
  email: string;
}

export interface UpdateUserRequest {
  email?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}