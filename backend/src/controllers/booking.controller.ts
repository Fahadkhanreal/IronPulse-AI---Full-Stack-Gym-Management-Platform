import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { CreateBookingInput } from '../schemas/booking.schema';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const { planId, bookingDate } = req.body as CreateBookingInput;

    // Verify plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json(error('Plan not found', `No plan found with ID: ${planId}`));
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.userId,
        planId,
        bookingDate: new Date(bookingDate),
        status: 'PENDING',
      },
      include: {
        plan: true,
      },
    });

    res.status(201).json(success('Booking created successfully', booking));
  } catch (err) {
    next(err);
  }
};

export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId || req.user.userId;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { bookingDate: 'desc' },
    });

    res.status(200).json(success('Bookings retrieved successfully', bookings));
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json(error('Authentication required', 'User not authenticated'));
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json(error('Booking not found', `No booking found with ID: ${id}`));
    }

    if (booking.userId !== req.user.userId) {
      return res.status(403).json(error('Access denied', 'You can only cancel your own bookings'));
    }

    // Update booking status to CANCELLED
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        plan: true,
      },
    });

    res.status(200).json(success('Booking cancelled successfully', updatedBooking));
  } catch (err) {
    next(err);
  }
};
