import { Request, Response } from 'express';
import { generateRAGResponseStream } from '../services/rag.service';
import { ChatRequestSchema } from '../types/chat.types';
import { buildErrorMessage, buildRateLimitMessage } from '../utils/prompt.utils';
import { saveConversation, updateConversation, getConversation } from '../services/chat-history.service';

/**
 * POST /api/v1/chat
 * Streaming chat endpoint using Server-Sent Events (SSE)
 */
export async function chatStream(req: Request, res: Response) {
  console.log('🔥 CHAT ENDPOINT HIT - Request received');

  try {
    // Validate request body
    const validation = ChatRequestSchema.safeParse(req.body);

    console.log('📝 Request body:', req.body);
    console.log('👤 User from JWT:', (req as any).user);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        code: 'INVALID_INPUT',
        details: validation.error.issues,
      });
    }

    const { message, userId, conversationId } = validation.data;

    // Extract authenticated user ID from JWT if available
    const authenticatedUserId = (req as any).user?.userId; // JWT contains 'userId' not 'id'

    // Use authenticated user ID if available, otherwise use provided userId
    const effectiveUserId = authenticatedUserId || userId;

    console.log(`💬 Chat request: "${message.substring(0, 50)}..." from user: ${effectiveUserId || 'guest'}`);
    console.log('🔍 Debug - authenticatedUserId:', authenticatedUserId, 'effectiveUserId:', effectiveUserId);

    // Load conversation history if conversationId provided
    let conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    let activeConversationId = conversationId;

    if (conversationId && effectiveUserId) {
      const conversation = await getConversation(conversationId, effectiveUserId);
      if (conversation) {
        conversationHistory = conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      }
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Send start event
    res.write(`data: ${JSON.stringify({
      type: 'start',
      conversationId: activeConversationId || 'new',
    })}\n\n`);

    const startTime = Date.now();
    let tokenCount = 0;
    let fullResponse = '';

    try {
      // Generate streaming response with user context and conversation history
      const stream = generateRAGResponseStream(message, {
        userId: effectiveUserId,
        conversationHistory,
      });

      // Stream tokens to client
      for await (const token of stream) {
        tokenCount++;
        fullResponse += token;
        res.write(`data: ${JSON.stringify({
          type: 'token',
          content: token,
        })}\n\n`);
      }

      const responseTime = Date.now() - startTime;

      // Save conversation to database if user is authenticated
      console.log('💾 Attempting to save conversation:', {
        effectiveUserId,
        hasResponse: !!fullResponse,
        conversationId: activeConversationId,
      });

      if (effectiveUserId && fullResponse) {
        const newMessages = [
          ...conversationHistory.map(msg => ({ ...msg, timestamp: new Date().toISOString() })),
          { role: 'user' as const, content: message, timestamp: new Date().toISOString() },
          { role: 'assistant' as const, content: fullResponse, timestamp: new Date().toISOString() },
        ];

        console.log('💾 Saving messages:', {
          messageCount: newMessages.length,
          isUpdate: !!activeConversationId,
        });

        try {
          if (activeConversationId) {
            // Update existing conversation
            await updateConversation(activeConversationId, newMessages);
            console.log('✅ Conversation updated:', activeConversationId);
          } else {
            // Create new conversation
            activeConversationId = await saveConversation(effectiveUserId, newMessages);
            console.log('✅ New conversation created:', activeConversationId);
          }
        } catch (saveError) {
          console.error('❌ Failed to save conversation:', saveError);
        }
      } else {
        console.log('⚠️ Skipping save - userId:', effectiveUserId, 'hasResponse:', !!fullResponse);
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'done',
        conversationId: activeConversationId,
        metadata: {
          tokensUsed: tokenCount,
          responseTime,
        },
      })}\n\n`);

      res.end();

      console.log(`✅ Chat response completed in ${responseTime}ms (${tokenCount} tokens)`);
      return;

    } catch (streamError) {
      console.error('Error during streaming:', streamError);

      // Send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        message: buildErrorMessage(),
        code: 'STREAM_ERROR',
      })}\n\n`);

      res.end();
      return;
    }

  } catch (error) {
    console.error('Error in chat controller:', error);

    // If headers not sent yet, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: buildErrorMessage(),
        code: 'INTERNAL_ERROR',
      });
    }

    // If streaming already started, send error event
    res.write(`data: ${JSON.stringify({
      type: 'error',
      message: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    })}\n\n`);

    res.end();
    return;
  }
}

/**
 * POST /api/v1/chat (non-streaming fallback)
 * Regular JSON response for clients that don't support SSE
 */
export async function chatNonStream(req: Request, res: Response) {
  try {
    // Validate request body
    const validation = ChatRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request format',
        code: 'INVALID_INPUT',
        details: validation.error.issues,
      });
    }

    const { message, userId } = validation.data;

    // Extract authenticated user ID from JWT if available
    const authenticatedUserId = (req as any).user?.id;
    const effectiveUserId = authenticatedUserId || userId;

    console.log(`💬 Chat request (non-stream): "${message.substring(0, 50)}..."`);

    // Import non-streaming RAG function
    const { generateRAGResponse } = await import('../services/rag.service');

    const response = await generateRAGResponse(message, {
      userId: effectiveUserId,
    });

    return res.status(200).json({
      success: true,
      data: {
        message: response.content,
        metadata: {
          tokensUsed: response.tokensUsed,
          responseTime: response.responseTime,
          retrievedDocs: response.retrievedDocs.length,
        },
      },
    });

  } catch (error) {
    console.error('Error in non-streaming chat:', error);

    return res.status(500).json({
      success: false,
      error: buildErrorMessage(),
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Handle rate limit exceeded
 */
export function handleRateLimitExceeded(_req: Request, res: Response) {
  return res.status(429).json({
    success: false,
    error: buildRateLimitMessage(),
    code: 'RATE_LIMIT_EXCEEDED',
  });
}
