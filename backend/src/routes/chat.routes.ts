import { Router } from 'express';
import { chatStream, chatNonStream, handleRateLimitExceeded } from '../controllers/chat.controller';
import {
  getLatestConversation,
  getHistory,
  getConversationById,
  deleteConversationById,
  deleteAllHistory,
} from '../controllers/history.controller';
import { authenticateOptional, authenticate } from '../middleware/auth.middleware';
import { chatRateLimit } from '../middleware/rateLimit.middleware';

const router = Router();

/**
 * POST /api/v1/chat
 * Main chat endpoint with Server-Sent Events (SSE) streaming
 *
 * Optional authentication - if JWT token provided, user context will be included
 * Rate limited to 10 requests per minute per user/IP
 */
router.post('/chat', chatRateLimit, authenticateOptional, chatStream);

/**
 * POST /api/v1/chat/non-stream
 * Fallback endpoint for clients that don't support SSE
 * Returns complete response as JSON
 */
router.post('/chat/non-stream', authenticateOptional, chatNonStream);

/**
 * GET /api/v1/chat/history/latest
 * Get the most recent conversation for authenticated user
 * Requires authentication
 */
router.get('/chat/history/latest', authenticate, getLatestConversation);

/**
 * GET /api/v1/chat/history
 * Get conversation history for authenticated user
 * Requires authentication
 */
router.get('/chat/history', authenticate, getHistory);

/**
 * GET /api/v1/chat/history/:conversationId
 * Get a specific conversation by ID
 * Requires authentication
 */
router.get('/chat/history/:conversationId', authenticate, getConversationById);

/**
 * DELETE /api/v1/chat/history/:conversationId
 * Delete a specific conversation
 * Requires authentication
 */
router.delete('/chat/history/:conversationId', authenticate, deleteConversationById);

/**
 * DELETE /api/v1/chat/history
 * Delete all conversations for authenticated user
 * Requires authentication
 */
router.delete('/chat/history', authenticate, deleteAllHistory);

/**
 * Rate limit exceeded handler
 * Returns 429 status with appropriate message
 */
router.use(handleRateLimitExceeded);

export default router;
