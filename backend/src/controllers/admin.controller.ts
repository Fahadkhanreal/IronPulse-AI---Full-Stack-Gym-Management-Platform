import { Request, Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { success, error } from '../utils/response';
import { AdminBookingsQuery, AdminPaymentsQuery } from '../schemas/admin.schema';

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Calculate total revenue from successful payments
    const revenueResult = await prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true },
    });

    // Count active members - try subscriptions first, fallback to payments
    let activeMembers = 0;
    try {
      // Count users with active subscriptions
      activeMembers = await prisma.user.count({
        where: {
          subscriptions: {
            some: {
              status: 'ACTIVE',
              endDate: { gte: new Date() },
            },
          },
        },
      });
    } catch (subscriptionError) {
      // Fallback: Count users with successful payments (if subscription table doesn't exist)
      console.warn('Subscription table not available, using payment count');
      activeMembers = await prisma.user.count({
        where: {
          payments: {
            some: {
              status: 'SUCCEEDED',
            },
          },
        },
      });
    }

    // Count total bookings/subscriptions
    let totalBookings = 0;
    try {
      // Try to count subscriptions
      totalBookings = await prisma.subscription.count();
    } catch (subscriptionError) {
      // Fallback: Count successful payments
      console.warn('Subscription table not available, using payment count');
      totalBookings = await prisma.payment.count({
        where: { status: 'SUCCEEDED' },
      });
    }

    // Get recent payments
    const recentPayments = await prisma.payment.findMany({
      where: { status: 'SUCCEEDED' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, title: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.status(200).json(success('Statistics retrieved successfully', {
      totalRevenue: revenueResult._sum.amount || 0,
      activeMembers,
      totalBookings,
      recentPayments,
    }));
  } catch (err) {
    next(err);
  }
};

export const getAdminBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, startDate, endDate, search } = req.query;

    // Parse pagination parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.bookingDate = {};
      if (startDate) {
        where.bookingDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.bookingDate.lte = new Date(endDate as string);
      }
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search as string, mode: 'insensitive' } } },
        { user: { email: { contains: search as string, mode: 'insensitive' } } },
      ];
    }

    // Get total count
    const total = await prisma.booking.count({ where });

    // Get paginated bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, title: true, price: true },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(200).json(success('Bookings retrieved successfully', {
      data: bookings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }));
  } catch (err) {
    next(err);
  }
};

export const getAdminPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, startDate, endDate } = req.query;

    // Parse pagination parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get total count
    const total = await prisma.payment.count({ where });

    // Get paginated payments
    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, title: true, price: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.status(200).json(success('Payments retrieved successfully', {
      data: payments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }));
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, hasSubscription } = req.query;

    // Parse pagination parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Build where clause
    const where: any = {
      role: 'MEMBER', // Only get regular members, not admins
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (hasSubscription === 'true') {
      where.subscriptions = {
        some: {
          status: 'ACTIVE',
          endDate: { gte: new Date() },
        },
      };
    } else if (hasSubscription === 'false') {
      where.subscriptions = {
        none: {
          status: 'ACTIVE',
          endDate: { gte: new Date() },
        },
      };
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated users with subscription and payment info
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: { gte: new Date() },
          },
          include: {
            plan: {
              select: { id: true, title: true, price: true },
            },
          },
        },
        payments: {
          where: { status: 'SUCCEEDED' },
          select: { amount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Transform the data to include active subscription info
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      hasActiveSubscription: user.subscriptions.length > 0,
      activePlan: user.subscriptions[0]?.plan || null,
      totalSpent: user.payments.reduce((sum, p) => sum + p.amount, 0),
    }));

    res.status(200).json(success('Users retrieved successfully', {
      data: transformedUsers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }));
  } catch (err) {
    next(err);
  }
};
