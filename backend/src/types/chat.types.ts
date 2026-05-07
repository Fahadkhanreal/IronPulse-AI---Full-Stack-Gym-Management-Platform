import { z } from 'zod';

// Document metadata schema
export const DocumentMetadataSchema = z.object({
  category: z.enum(['plan', 'trainer', 'timing', 'faq', 'workout', 'facility', 'policy']),
  source: z.string().regex(/^[a-z]+:[a-z0-9-_:]+$/i),
  entityId: z.string().optional(),
  chunkIndex: z.number().int().nonnegative().optional(),
  lastUpdated: z.string().datetime(),
  language: z.enum(['en', 'ur']),
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type DocumentMetadata = z.infer<typeof DocumentMetadataSchema>;

// Document schema
export const DocumentSchema = z.object({
  content: z.string().min(10).max(10000),
  metadata: DocumentMetadataSchema,
  embedding: z.array(z.number()).length(1024),
});

export type DocumentInput = z.infer<typeof DocumentSchema>;

// Chat message metadata schema
export const ChatMessageMetadataSchema = z.object({
  retrievedDocs: z.array(z.object({
    id: z.number(),
    content: z.string(),
    similarity: z.number().min(0).max(1),
    category: z.string(),
  })).max(10).optional(),
  tokensUsed: z.number().int().positive().optional(),
  responseTime: z.number().int().positive().optional(),
  error: z.string().optional(),
  userContext: z.boolean().optional(),
});

export type ChatMessageMetadata = z.infer<typeof ChatMessageMetadataSchema>;

// Chat message schema
export const ChatMessageSchema = z.object({
  id: z.string().cuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  timestamp: z.string().datetime(),
  metadata: ChatMessageMetadataSchema.optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// Conversation messages schema
export const ConversationMessagesSchema = z.object({
  messages: z.array(ChatMessageSchema),
  summary: z.string().optional(),
});

export type ConversationMessages = z.infer<typeof ConversationMessagesSchema>;

// Chat request schema
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500).trim(),
  userId: z.string().cuid().optional(),
  conversationId: z.string().cuid().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// Ingest request schema
export const IngestRequestSchema = z.object({
  documents: z.array(z.object({
    content: z.string().min(10).max(50000),
    metadata: DocumentMetadataSchema,
  })).min(1).max(100),
  autoChunk: z.boolean().default(true).optional(),
  replaceExisting: z.boolean().default(false).optional(),
});

export type IngestRequest = z.infer<typeof IngestRequestSchema>;

// User context schema
export const UserContextSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  currentPlan: z.object({
    id: z.string(),
    name: z.string(),
    startDate: z.string().datetime(),
    expiryDate: z.string().datetime(),
    remainingDays: z.number().int(),
    status: z.enum(['active', 'expired', 'expiring_soon']),
  }).optional(),
  bookings: z.object({
    upcoming: z.number().int(),
    lastBooking: z.string().datetime().optional(),
  }).optional(),
  preferences: z.object({
    language: z.enum(['en', 'ur']),
    notificationsEnabled: z.boolean(),
  }).optional(),
});

export type UserContext = z.infer<typeof UserContextSchema>;
