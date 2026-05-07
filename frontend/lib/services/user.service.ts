import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserResponse {
  success: boolean;
  message: string;
  data: User;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
}

export const userService = {
  // Get user profile (protected)
  async getProfile(): Promise<UserResponse> {
    return await api.get('/user/profile');
  },

  // Update user profile (protected)
  async updateProfile(data: UpdateProfileData): Promise<UserResponse> {
    return await api.put('/user/profile', data);
  },
};
