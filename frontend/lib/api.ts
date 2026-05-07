import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors with toast notifications
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (typeof window !== 'undefined') {
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Session expired. Please login again.');

        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }

      // Handle other errors with toast
      else if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission.');
      }
      else if (error.response?.status === 404) {
        toast.error('Resource not found.');
      }
      else if (error.response?.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      // For validation errors (400), let the component handle the message
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default api;
