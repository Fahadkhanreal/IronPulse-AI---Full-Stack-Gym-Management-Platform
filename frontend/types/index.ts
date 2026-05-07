// Core Entities
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
  createdAt: string;
  updatedAt?: string;
}

export interface Plan {
  id: string;
  title: string;
  price: number;
  duration: number;
  features: string[];
  stripePriceId?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  planId: string;
  bookingDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  user?: User;
  plan?: Plan;
}

export interface Trainer {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  image: string;
  bio?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'PENDING' | 'PROCESSED';
  createdAt: string;
}

// API Response Types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Authentication Responses
export interface LoginResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
}

export interface SignupResponse {
  success: true;
  data: {
    token: string;
    user: User;
  };
}

// Form Input Types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface BookingFormData {
  planId: string;
  bookingDate: string;
  timeSlot?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ProfileUpdateFormData {
  name: string;
  email: string;
}

// Client State Types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}
