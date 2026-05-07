import api from '@/lib/api';
import { Booking } from '@/types';

interface BookingsResponse {
  success: boolean;
  message: string;
  data: Booking[];
}

interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

interface CreateBookingData {
  planId: string;
  bookingDate: string; // ISO format
}

export const bookingService = {
  // Create booking (protected)
  async createBooking(data: CreateBookingData): Promise<BookingResponse> {
    return await api.post('/bookings', data);
  },

  // Get user's bookings (protected)
  async getMyBookings(): Promise<BookingsResponse> {
    return await api.get('/bookings');
  },

  // Cancel booking (protected)
  async cancelBooking(id: string): Promise<BookingResponse> {
    return await api.delete(`/bookings/${id}`);
  },
};
