import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedConversations {
  conversations: Conversation[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Save a conversation to the database
 */
export async function saveConversation(
  userId: string,
  messages: ConversationMessage[]
): Promise<string> {
  try {
    const conversation = await prisma.chatHistory.create({
      data: {
        userId,
        messages: messages as any, // Prisma Json type
      },
    });

    return conversation.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw new Error(`Failed to save conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update an existing conversation with new messages
 */
export async function updateConversation(
  conversationId: string,
  messages: ConversationMessage[]
): Promise<void> {
  try {
    await prisma.chatHistory.update({
      where: { id: conversationId },
      data: {
        messages: messages as any,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw new Error(`Failed to update conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(
  conversationId: string,
  userId: string
): Promise<Conversation | null> {
  try {
    const conversation = await prisma.chatHistory.findFirst({
      where: {
        id: conversationId,
        userId, // Ensure user can only access their own conversations
      },
    });

    if (!conversation) {
      return null;
    }

    return {
      id: conversation.id,
      userId: conversation.userId,
      messages: conversation.messages as unknown as ConversationMessage[],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw new Error(`Failed to get conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get conversation history for a user with pagination
 */
export async function getConversationHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedConversations> {
  try {
    const skip = (page - 1) * pageSize;

    const [conversations, total] = await Promise.all([
      prisma.chatHistory.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.chatHistory.count({ where: { userId } }),
    ]);

    const formattedConversations: Conversation[] = conversations.map((conv) => ({
      id: conv.id,
      userId: conv.userId,
      messages: conv.messages as unknown as ConversationMessage[],
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }));

    return {
      conversations: formattedConversations,
      total,
      page,
      pageSize,
      hasMore: skip + conversations.length < total,
    };
  } catch (error) {
    console.error('Error getting conversation history:', error);
    throw new Error(`Failed to get conversation history: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await prisma.chatHistory.deleteMany({
      where: {
        id: conversationId,
        userId, // Ensure user can only delete their own conversations
      },
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw new Error(`Failed to delete conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete all conversations for a user
 */
export async function deleteAllConversations(userId: string): Promise<number> {
  try {
    const result = await prisma.chatHistory.deleteMany({
      where: { userId },
    });

    return result.count;
  } catch (error) {
    console.error('Error deleting all conversations:', error);
    throw new Error(`Failed to delete conversations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get conversation summary (first user message) for display in history list
 */
export function getConversationSummary(messages: ConversationMessage[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user');
  if (!firstUserMessage) {
    return 'New conversation';
  }

  const content = firstUserMessage.content;
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
}

/**
 * Get message count for a conversation
 */
export function getMessageCount(messages: ConversationMessage[]): {
  total: number;
  user: number;
  assistant: number;
} {
  return {
    total: messages.length,
    user: messages.filter((msg) => msg.role === 'user').length,
    assistant: messages.filter((msg) => msg.role === 'assistant').length,
  };
}
