import api from '@/lib/api';
import { User } from '@/types';

// Types matching backend response
interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
    };
    token: string;
  };
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  // Signup
  async signup(data: SignupData): Promise<AuthResponse> {
    return await api.post('/auth/signup', data);
  },

  // Login
  async login(data: LoginData): Promise<AuthResponse> {
    return await api.post('/auth/login', data);
  },
};
