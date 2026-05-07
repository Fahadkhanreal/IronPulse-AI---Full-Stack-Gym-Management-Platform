import api from '@/lib/api';

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  image: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface TestimonialsResponse {
  success: boolean;
  message: string;
  data: Testimonial[];
}

interface TestimonialResponse {
  success: boolean;
  message: string;
  data: Testimonial;
}

export interface CreateTestimonialInput {
  name: string;
  text: string;
  rating: number;
  image: string;
  role?: string;
}

export interface UpdateTestimonialInput {
  name?: string;
  text?: string;
  rating?: number;
  image?: string;
  role?: string;
}

export const testimonialService = {
  // Get all testimonials (public)
  async getAllTestimonials(): Promise<TestimonialsResponse> {
    return await api.get('/testimonials');
  },

  // Get single testimonial (public)
  async getTestimonialById(id: string): Promise<TestimonialResponse> {
    return await api.get(`/testimonials/${id}`);
  },

  // Create testimonial (admin only)
  async createTestimonial(data: CreateTestimonialInput): Promise<TestimonialResponse> {
    return await api.post('/testimonials', data);
  },

  // Update testimonial (admin only)
  async updateTestimonial(id: string, data: UpdateTestimonialInput): Promise<TestimonialResponse> {
    return await api.put(`/testimonials/${id}`, data);
  },

  // Delete testimonial (admin only)
  async deleteTestimonial(id: string): Promise<TestimonialResponse> {
    return await api.delete(`/testimonials/${id}`);
  },
};
