import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { buildErrorMessage } from '../utils/prompt.utils';

/**
 * GET /api/v1/admin/analytics/chat
 * Get chat analytics and statistics
 */
export async function getChatAnalytics(req: Request, res: Response) {
  try {
    const { startDate, endDate } = req.query;

    // Default to last 30 days if no date range provided
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total conversations
    const totalConversations = await prisma.chatHistory.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Conversations by user type (authenticated vs guest)
    const authenticatedConversations = await prisma.chatHistory.count({
      where: {
        userId: { not: null },
        createdAt: { gte: start, lte: end },
      },
    });

    const guestConversations = totalConversations - authenticatedConversations;

    // Average messages per conversation
    const conversations = await prisma.chatHistory.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      select: {
        messages: true,
      },
    });

    const totalMessages = conversations.reduce((sum, conv) => {
      const messages = conv.messages as any[];
      return sum + messages.length;
    }, 0);

    const avgMessagesPerConversation = totalConversations > 0
      ? Math.round(totalMessages / totalConversations)
      : 0;

    // Most active users
    const activeUsers = await prisma.chatHistory.groupBy({
      by: ['userId'],
      where: {
        userId: { not: null },
        createdAt: { gte: start, lte: end },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get user details for active users
    const userIds = activeUsers.map(u => u.userId).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const activeUsersWithDetails = activeUsers.map(au => {
      const user = users.find(u => u.id === au.userId);
      return {
        userId: au.userId,
        name: user?.name || 'Unknown',
        email: user?.email || 'Unknown',
        conversationCount: au._count.id,
      };
    });

    // Conversations over time (daily) - safe query
    let conversationsByDay: Array<{ date: string; count: bigint }> = [];
    try {
      conversationsByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "ChatHistory"
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY DATE("createdAt")
        ORDER BY DATE("createdAt")
      `;
    } catch (e) {
      console.warn('ChatHistory table not found');
    }

    // Knowledge base stats - safe query
    let documentCounts: Array<{ category: string; count: bigint }> = [];
    try {
      documentCounts = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
        SELECT metadata->>'category' as category, COUNT(*)::int as count
        FROM "Document"
        GROUP BY metadata->>'category'
      `;
    } catch (e) {
      // Table doesn't exist, return empty
      console.warn('Document table not found, skipping knowledge base stats');
    }

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalConversations,
          authenticatedConversations,
          guestConversations,
          avgMessagesPerConversation,
          totalMessages,
        },
        activeUsers: activeUsersWithDetails,
        conversationsByDay: conversationsByDay.map(row => ({
          date: row.date,
          count: Number(row.count),
        })),
        knowledgeBase: documentCounts.map(row => ({
          category: row.category,
          count: Number(row.count),
        })),
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error in getChatAnalytics:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/admin/analytics/popular-questions
 * Get most frequently asked questions
 */
export async function getPopularQuestions(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    // Get all conversations and extract user messages
    const conversations = await prisma.chatHistory.findMany({
      select: {
        messages: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1000, // Analyze last 1000 conversations
    });

    // Extract user messages
    const userMessages: string[] = [];
    conversations.forEach(conv => {
      const messages = conv.messages as any[];
      messages.forEach(msg => {
        if (msg.role === 'user' && msg.content) {
          userMessages.push(msg.content.toLowerCase().trim());
        }
      });
    });

    // Count message frequency
    const messageCounts = new Map<string, number>();
    userMessages.forEach(msg => {
      messageCounts.set(msg, (messageCounts.get(msg) || 0) + 1);
    });

    // Sort by frequency and get top questions
    const popularQuestions = Array.from(messageCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([question, count]) => ({ question, count }));

    return res.status(200).json({
      success: true,
      data: {
        popularQuestions,
        totalUniqueQuestions: messageCounts.size,
        totalQuestions: userMessages.length,
      },
    });
  } catch (error) {
    console.error('Error in getPopularQuestions:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/admin/analytics/response-times
 * Get average response times
 */
export async function getResponseTimes(req: Request, res: Response) {
  try {
    // This is a simplified version - in production, you'd track actual response times
    // For now, we'll return mock data based on conversation patterns

    const conversations = await prisma.chatHistory.findMany({
      select: {
        messages: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    const responseTimes = conversations.map(conv => {
      const messages = conv.messages as any[];
      const messageCount = messages.length;

      // Estimate response time based on conversation duration and message count
      const duration = new Date(conv.updatedAt).getTime() - new Date(conv.createdAt).getTime();
      const avgTimePerMessage = messageCount > 0 ? duration / messageCount : 0;

      return {
        conversationId: conv.createdAt.toISOString(),
        avgResponseTime: Math.round(avgTimePerMessage / 1000), // Convert to seconds
        messageCount,
      };
    });

    const overallAvg = responseTimes.reduce((sum, rt) => sum + rt.avgResponseTime, 0) / responseTimes.length;

    return res.status(200).json({
      success: true,
      data: {
        averageResponseTime: Math.round(overallAvg),
        responseTimes: responseTimes.slice(0, 20),
      },
    });
  } catch (error) {
    console.error('Error in getResponseTimes:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/admin/analytics/revenue
 * Get monthly revenue analytics
 */
export async function getRevenueAnalytics(req: Request, res: Response) {
  try {
    // Get last 12 months of data
    const months = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Get monthly revenue data - safe query
    let monthlyRevenue: Array<{ month: string; revenue: number; count: number }> = [];
    try {
      monthlyRevenue = await prisma.$queryRaw<Array<{ month: string; revenue: number; count: number }>>`
        SELECT
          TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
          SUM(amount)::float as revenue,
          COUNT(*)::int as count
        FROM "Payment"
        WHERE status = 'SUCCEEDED'
          AND "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      `;
    } catch (e) {
      console.warn('Payment table issue');
    }

    // Get total revenue
    const totalRevenueResult = await prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { amount: true },
    });

    // Get total successful payments count
    const totalPaymentsCount = await prisma.payment.count({
      where: { status: 'SUCCEEDED' },
    });

    // Calculate average revenue per payment
    const avgRevenuePerPayment = totalPaymentsCount > 0
      ? (totalRevenueResult._sum.amount || 0) / totalPaymentsCount
      : 0;

    // Calculate growth rate
    const revenueArray = monthlyRevenue.map(m => Number(m.revenue));
    let growthRate = 0;
    if (revenueArray.length >= 2) {
      const lastMonth = revenueArray[revenueArray.length - 1];
      const previousMonth = revenueArray[revenueArray.length - 2];
      if (previousMonth > 0) {
        growthRate = ((lastMonth - previousMonth) / previousMonth) * 100;
      }
    }

    // Format month labels for display
    const formattedData = monthlyRevenue.map(m => ({
      month: m.month,
      monthLabel: new Date(m.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: Number(m.revenue),
      count: Number(m.count),
    }));

    return res.status(200).json({
      success: true,
      data: {
        monthlyRevenue: formattedData,
        overview: {
          totalRevenue: totalRevenueResult._sum.amount || 0,
          totalPayments: totalPaymentsCount,
          avgRevenuePerPayment,
          lastMonthGrowth: Math.round(growthRate * 10) / 10,
        },
      },
    });
  } catch (error) {
    console.error('Error in getRevenueAnalytics:', error);
    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}
