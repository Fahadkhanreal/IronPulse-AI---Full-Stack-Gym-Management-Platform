import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // Increased to 30s for serverless cold starts + email sending
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token (except for public endpoints)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // Public endpoints that don't need authentication
      const publicEndpoints = [
        '/plans',
        '/trainers',
        '/auth/login',
        '/auth/signup',
        '/auth/forgot-password',
        '/auth/reset-password',
      ];

      // Check if the request URL matches any public endpoint (exact match or with query params)
      const isPublicEndpoint = publicEndpoints.some(endpoint => {
        const url = config.url || '';
        // Exact match or starts with endpoint followed by ? (query params)
        return url === endpoint || url.startsWith(endpoint + '?');
      });

      // Special case: /testimonials (public) but NOT /testimonials/my/* or /testimonials/admin/*
      const isPublicTestimonials =
        config.url === '/testimonials' ||
        config.url?.startsWith('/testimonials?');

      // Only attach token for non-public endpoints
      if (!isPublicEndpoint && !isPublicTestimonials) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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
        // Only clear auth and redirect if this was an authenticated request
        // (i.e., if we actually sent a token)
        const hadToken = error.config?.headers?.Authorization;

        if (hadToken) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again.');

          // Redirect to login after a short delay
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
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
