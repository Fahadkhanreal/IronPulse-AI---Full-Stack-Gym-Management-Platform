import { Request, Response } from 'express';
import {
  getConversationHistory,
  getConversation,
  deleteConversation,
  deleteAllConversations,
  getConversationSummary,
  getMessageCount,
} from '../services/chat-history.service';
import { buildErrorMessage } from '../utils/prompt.utils';

/**
 * GET /api/v1/chat/history/latest
 * Get the most recent conversation for authenticated user
 */
export async function getLatestConversation(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Get the most recent conversation (page 1, limit 1)
    const history = await getConversationHistory(userId, 1, 1);

    if (history.conversations.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          conversation: null,
        },
      });
    }

    const latestConversation = history.conversations[0];

    return res.status(200).json({
      success: true,
      data: {
        conversation: {
          id: latestConversation.id,
          messages: latestConversation.messages,
          createdAt: latestConversation.createdAt,
          updatedAt: latestConversation.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error in getLatestConversation:', error);

    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/chat/history
 * Get conversation history for authenticated user
 */
export async function getHistory(req: Request, res: Response) {
  try {
    // Extract authenticated user ID from JWT
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;

    // Validate pagination
    if (page < 1 || pageSize < 1 || pageSize > 50) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters',
        code: 'INVALID_PARAMS',
      });
    }

    const history = await getConversationHistory(userId, page, pageSize);

    // Add summaries to conversations
    const conversationsWithSummary = history.conversations.map((conv) => ({
      id: conv.id,
      summary: getConversationSummary(conv.messages),
      messageCount: getMessageCount(conv.messages),
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        conversations: conversationsWithSummary,
        pagination: {
          total: history.total,
          page: history.page,
          pageSize: history.pageSize,
          hasMore: history.hasMore,
        },
      },
    });
  } catch (error) {
    console.error('Error in getHistory:', error);

    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * GET /api/v1/chat/history/:conversationId
 * Get a specific conversation by ID
 */
export async function getConversationById(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const conversationId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID required',
        code: 'INVALID_PARAMS',
      });
    }

    const conversation = await getConversation(conversationId, userId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          messages: conversation.messages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Error in getConversationById:', error);

    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * DELETE /api/v1/chat/history/:conversationId
 * Delete a specific conversation
 */
export async function deleteConversationById(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const conversationId = Array.isArray(req.params.conversationId) ? req.params.conversationId[0] : req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID required',
        code: 'INVALID_PARAMS',
      });
    }

    const deleted = await deleteConversation(conversationId, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found',
        code: 'NOT_FOUND',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteConversationById:', error);

    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * DELETE /api/v1/chat/history
 * Delete all conversations for authenticated user
 */
export async function deleteAllHistory(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const deletedCount = await deleteAllConversations(userId);

    return res.status(200).json({
      success: true,
      message: `Deleted ${deletedCount} conversation(s)`,
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error('Error in deleteAllHistory:', error);

    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}
