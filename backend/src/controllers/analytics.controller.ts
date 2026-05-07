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

    // Conversations over time (daily)
    const conversationsByDay = await prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM "ChatHistory"
      WHERE created_at >= ${start} AND created_at <= ${end}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;

    // Knowledge base stats
    const documentCounts = await prisma.$queryRaw<Array<{ category: string; count: bigint }>>`
      SELECT metadata->>'category' as category, COUNT(*)::int as count
      FROM "Document"
      GROUP BY metadata->>'category'
    `;

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
