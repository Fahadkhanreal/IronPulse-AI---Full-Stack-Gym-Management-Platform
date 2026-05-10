// Frontend service for testimonials
import api from '../api';

export interface Testimonial {
  id: string;
  userId: string;
  text: string;
  rating: number;
  image?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface CreateTestimonialData {
  text: string;
  rating?: number;
  image?: string | null;
}

export interface UpdateTestimonialData {
  text?: string;
  rating?: number;
  image?: string | null;
}

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get all approved testimonials (public)
 */
export const getApprovedTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api.get('/testimonials');
  return response.data || [];
};

// ==================== MEMBER ENDPOINTS ====================

/**
 * Submit a new testimonial (authenticated member)
 */
export const submitTestimonial = async (data: CreateTestimonialData): Promise<Testimonial> => {
  const response = await api.post('/testimonials', data);
  return response.data;
};

/**
 * Get my testimonials (authenticated member)
 */
export const getMyTestimonials = async (): Promise<Testimonial[]> => {
  const response = await api.get('/testimonials/my/testimonials');
  return response.data || [];
};

/**
 * Update my testimonial (authenticated member)
 */
export const updateMyTestimonial = async (id: string, data: UpdateTestimonialData): Promise<Testimonial> => {
  const response = await api.put(`/testimonials/my/${id}`, data);
  return response.data;
};

/**
 * Delete my testimonial (authenticated member)
 */
export const deleteMyTestimonial = async (id: string): Promise<void> => {
  await api.delete(`/testimonials/my/${id}`);
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all testimonials with optional status filter (admin only)
 */
export const getAllTestimonialsAdmin = async (status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Testimonial[]> => {
  const params = status ? { status } : {};
  const response = await api.get('/testimonials/admin/all', { params });
  return response.data; // Fixed: interceptor already extracts response.data
};

/**
 * Approve testimonial (admin only)
 */
export const approveTestimonial = async (id: string): Promise<Testimonial> => {
  const response = await api.patch(`/testimonials/admin/${id}/approve`);
  return response.data; // Fixed
};

/**
 * Reject testimonial (admin only)
 */
export const rejectTestimonial = async (id: string): Promise<Testimonial> => {
  const response = await api.patch(`/testimonials/admin/${id}/reject`);
  return response.data; // Fixed
};

/**
 * Delete testimonial (admin only)
 */
export const deleteTestimonialAdmin = async (id: string): Promise<void> => {
  await api.delete(`/testimonials/admin/${id}`);
};
