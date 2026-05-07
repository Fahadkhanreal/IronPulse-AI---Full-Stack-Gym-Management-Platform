# Data Model: AI-Powered Gym Support Chatbot

**Feature**: 001-ai-chatbot-rag  
**Phase**: 1 (Design)  
**Date**: 2026-05-06

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the RAG-powered chatbot feature. All entities are designed to support the functional requirements defined in the specification.

---

## Entity Definitions

### 1. Document (Knowledge Base)

**Purpose**: Stores chunked knowledge base content with vector embeddings for semantic search.

**Schema**:
```prisma
model Document {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  metadata  Json
  embedding Unsupported("vector(1024)")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
  @@index([metadata(ops: JsonbOps)], type: Gin)
}
```

**Fields**:
- `id`: Auto-incrementing primary key
- `content`: The actual text content of the document chunk (TEXT type for large content)
- `metadata`: JSON object containing document metadata (see Metadata Structure below)
- `embedding`: 1024-dimensional vector from Cohere embed-v4.0 (pgvector type)
- `createdAt`: Timestamp when document was ingested
- `updatedAt`: Timestamp when document was last updated

**Metadata Structure**:
```typescript
interface DocumentMetadata {
  category: 'plan' | 'trainer' | 'timing' | 'faq' | 'workout' | 'facility' | 'policy';
  source: string; // e.g., 'database:plans', 'admin:upload:workout-guide.pdf'
  entityId?: string; // Foreign key to source entity (planId, trainerId, etc.)
  chunkIndex?: number; // For multi-chunk documents, indicates position
  lastUpdated: string; // ISO timestamp of source data
  language: 'en' | 'ur'; // Language of content
  title?: string; // Optional title for the document
  tags?: string[]; // Optional tags for filtering
}
```

**Validation Rules**:
- `content`: Required, min length 10 characters, max length 10,000 characters
- `metadata.category`: Required, must be one of the defined categories
- `metadata.source`: Required, must follow format `{sourceType}:{identifier}`
- `metadata.language`: Required, must be 'en' or 'ur'
- `embedding`: Required, must be exactly 1024 dimensions

**Indexes**:
- Primary key on `id`
- Vector index on `embedding` (IVFFlat with cosine distance)
- B-tree index on `createdAt` for time-based queries
- GIN index on `metadata` for JSON field queries

**Relationships**:
- No direct foreign keys (metadata.entityId is a soft reference)
- Linked to source entities (Plan, Trainer) via metadata.entityId

**State Transitions**:
- **Created**: Document ingested with embedding
- **Updated**: Content or metadata changed, embedding regenerated
- **Deleted**: Document removed from knowledge base

---

### 2. ChatHistory (Conversation Storage)

**Purpose**: Stores conversation history for logged-in users to enable context continuity and history retrieval.

**Schema**:
```prisma
model ChatHistory {
  id             String   @id @default(cuid())
  userId         String?
  conversationId String   @default(cuid())
  messages       Json
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([conversationId])
  @@index([createdAt])
}
```

**Fields**:
- `id`: CUID primary key
- `userId`: Foreign key to User (nullable for guest conversations)
- `conversationId`: Groups messages into conversations (CUID)
- `messages`: JSON array of message objects (see Message Structure below)
- `createdAt`: Timestamp when conversation started
- `updatedAt`: Timestamp when conversation was last updated

**Message Structure**:
```typescript
interface Message {
  id: string; // Unique message ID (CUID)
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string; // ISO timestamp
  metadata?: {
    retrievedDocs?: string[]; // Document IDs used for this response
    tokensUsed?: number; // Token count for this message
    responseTime?: number; // Milliseconds to generate response
    error?: string; // Error message if generation failed
  };
}

interface ConversationMessages {
  messages: Message[];
  summary?: string; // Optional conversation summary for long histories
}
```

**Validation Rules**:
- `userId`: Optional, must be valid User ID if provided
- `conversationId`: Required, must be CUID format
- `messages`: Required, must be valid JSON array
- `messages[].role`: Required, must be 'user', 'assistant', or 'system'
- `messages[].content`: Required, min length 1 character, max length 10,000 characters
- `messages[].timestamp`: Required, must be valid ISO timestamp

**Indexes**:
- Primary key on `id`
- B-tree index on `userId` for user history queries
- B-tree index on `conversationId` for conversation retrieval
- B-tree index on `createdAt` for time-based queries

**Relationships**:
- `userId` → `User.id` (optional, cascade delete)

**State Transitions**:
- **Active**: Conversation is ongoing, messages being added
- **Archived**: Conversation older than 30 days (soft delete)
- **Deleted**: User explicitly deleted conversation history

**Retention Policy**:
- Guest conversations: Deleted after 24 hours
- User conversations: Retained for 30 days, then archived
- Archived conversations: Retained for 90 days, then hard deleted

---

### 3. UserContext (Personalization Data)

**Purpose**: Virtual entity (not a database table) that aggregates user-specific data for personalized responses.

**Structure**:
```typescript
interface UserContext {
  userId: string;
  name: string;
  email: string;
  currentPlan?: {
    id: string;
    name: string;
    startDate: string; // ISO timestamp
    expiryDate: string; // ISO timestamp
    remainingDays: number; // Calculated field
    status: 'active' | 'expired' | 'expiring_soon'; // Calculated field
  };
  bookings?: {
    upcoming: number; // Count of upcoming bookings
    lastBooking?: string; // ISO timestamp
  };
  preferences?: {
    language: 'en' | 'ur';
    notificationsEnabled: boolean;
  };
}
```

**Data Sources**:
- `User` table: name, email, preferences
- `Subscription` table: currentPlan, startDate, expiryDate
- `Booking` table: upcoming bookings count

**Validation Rules**:
- `userId`: Required, must be valid User ID
- `currentPlan.expiryDate`: Must be valid ISO timestamp
- `currentPlan.remainingDays`: Calculated as `Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24))`
- `currentPlan.status`: 
  - 'active' if remainingDays > 7
  - 'expiring_soon' if 0 < remainingDays <= 7
  - 'expired' if remainingDays <= 0

**Computed Fields**:
```typescript
function calculateUserContext(user: User): UserContext {
  const now = new Date();
  const expiryDate = new Date(user.subscription?.expiryDate || now);
  const remainingDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'active' | 'expired' | 'expiring_soon';
  if (remainingDays > 7) status = 'active';
  else if (remainingDays > 0) status = 'expiring_soon';
  else status = 'expired';
  
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    currentPlan: user.subscription ? {
      id: user.subscription.planId,
      name: user.subscription.plan.name,
      startDate: user.subscription.startDate.toISOString(),
      expiryDate: user.subscription.expiryDate.toISOString(),
      remainingDays,
      status,
    } : undefined,
    bookings: {
      upcoming: user.bookings.filter(b => new Date(b.date) > now).length,
      lastBooking: user.bookings[0]?.date.toISOString(),
    },
    preferences: {
      language: user.preferredLanguage || 'en',
      notificationsEnabled: user.notificationsEnabled,
    },
  };
}
```

**Authorization**:
- User can only access their own UserContext
- Admin cannot access UserContext for other users (privacy)
- Chatbot can only inject UserContext for the authenticated user making the request

---

### 4. ChatMessage (Runtime Entity)

**Purpose**: Represents a single message in an active chat session (not persisted directly, part of ChatHistory.messages).

**Structure**:
```typescript
interface ChatMessage {
  id: string; // CUID
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string; // ISO timestamp
  metadata?: ChatMessageMetadata;
}

interface ChatMessageMetadata {
  retrievedDocs?: RetrievedDocument[]; // Documents used for RAG
  tokensUsed?: number; // Token count
  responseTime?: number; // Milliseconds
  error?: string; // Error message if failed
  userContext?: boolean; // Whether user context was injected
}

interface RetrievedDocument {
  id: number; // Document.id
  content: string; // Document.content
  similarity: number; // Cosine similarity score (0-1)
  category: string; // Document.metadata.category
}
```

**Validation Rules**:
- `id`: Required, must be CUID format
- `role`: Required, must be 'user', 'assistant', or 'system'
- `content`: Required, min 1 character, max 10,000 characters
- `timestamp`: Required, must be valid ISO timestamp
- `metadata.retrievedDocs`: Optional, max 10 documents
- `metadata.tokensUsed`: Optional, must be positive integer
- `metadata.responseTime`: Optional, must be positive integer (milliseconds)

**Lifecycle**:
1. **User Message Created**: User sends message via chat widget
2. **Processing**: Backend retrieves relevant documents, generates response
3. **Assistant Message Created**: LLM response streamed to frontend
4. **Persisted**: Both messages saved to ChatHistory.messages
5. **Displayed**: Messages rendered in chat UI

---

## Relationships Diagram

```
User (existing)
  ↓ (1:many, optional)
ChatHistory
  ├─ conversationId (groups messages)
  └─ messages[] (JSON array of ChatMessage)

Document (knowledge base)
  ↔ (soft reference via metadata.entityId)
Plan, Trainer, etc. (existing entities)

UserContext (virtual)
  ← aggregates from User, Subscription, Booking
```

---

## Data Flow

### 1. Knowledge Base Ingestion Flow
```
Source Data (Plan, Trainer, Admin Upload)
  ↓
Chunking (400 tokens per chunk)
  ↓
Embedding Generation (Cohere embed-v4.0)
  ↓
Document Creation (content + metadata + embedding)
  ↓
Vector Index Update (pgvector)
```

### 2. Chat Request Flow
```
User Message
  ↓
Input Sanitization
  ↓
Query Embedding Generation
  ↓
Vector Similarity Search (top 5 documents)
  ↓
User Context Retrieval (if authenticated)
  ↓
System Prompt Construction (context + user data)
  ↓
LLM Generation (Groq streaming)
  ↓
Response Streaming (SSE)
  ↓
ChatHistory Persistence
```

### 3. Conversation History Flow
```
User Opens Chat Widget
  ↓
Load Recent Conversations (last 5)
  ↓
User Selects Conversation
  ↓
Load Full Message History
  ↓
Display Messages
  ↓
Continue Conversation (context maintained)
```

---

## Validation Schemas (Zod)

### Document Validation
```typescript
import { z } from 'zod';

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

export const DocumentSchema = z.object({
  content: z.string().min(10).max(10000),
  metadata: DocumentMetadataSchema,
  embedding: z.array(z.number()).length(1024),
});
```

### Chat Message Validation
```typescript
export const ChatMessageSchema = z.object({
  id: z.string().cuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  timestamp: z.string().datetime(),
  metadata: z.object({
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
  }).optional(),
});

export const ConversationMessagesSchema = z.object({
  messages: z.array(ChatMessageSchema),
  summary: z.string().optional(),
});
```

### Chat Request Validation
```typescript
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500).trim(),
  userId: z.string().cuid().optional(),
  conversationId: z.string().cuid().optional(),
});
```

### Ingest Request Validation
```typescript
export const IngestRequestSchema = z.object({
  documents: z.array(z.object({
    content: z.string().min(10).max(50000),
    metadata: DocumentMetadataSchema,
  })).min(1).max(100),
});
```

---

## Database Migrations

### Migration 1: Add pgvector Extension
```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### Migration 2: Create Document Table
```sql
CREATE TABLE "Document" (
  "id" SERIAL PRIMARY KEY,
  "content" TEXT NOT NULL,
  "metadata" JSONB NOT NULL,
  "embedding" vector(1024),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create indexes
CREATE INDEX "Document_createdAt_idx" ON "Document"("createdAt");
CREATE INDEX "Document_metadata_idx" ON "Document" USING GIN ("metadata");
CREATE INDEX "Document_embedding_idx" ON "Document" 
  USING ivfflat ("embedding" vector_cosine_ops) 
  WITH (lists = 100);
```

### Migration 3: Create ChatHistory Table
```sql
CREATE TABLE "ChatHistory" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "conversationId" TEXT NOT NULL,
  "messages" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "ChatHistory_userId_idx" ON "ChatHistory"("userId");
CREATE INDEX "ChatHistory_conversationId_idx" ON "ChatHistory"("conversationId");
CREATE INDEX "ChatHistory_createdAt_idx" ON "ChatHistory"("createdAt");
```

---

## Performance Considerations

### Vector Search Optimization
- **Index Type**: Start with IVFFlat (lists=100) for <10k documents
- **Upgrade Path**: Migrate to HNSW (m=16, ef_construction=64) when dataset grows
- **Query Limit**: Always limit to top-k results (k=5 recommended)
- **Similarity Threshold**: Filter results with similarity > 0.7 to reduce noise

### JSON Field Queries
- **GIN Index**: Enables fast queries on metadata fields
- **Query Pattern**: Use `metadata @> '{"category": "plan"}'` for filtering
- **Avoid**: Full JSON scans without index support

### Conversation History
- **Pagination**: Load conversations in batches of 20
- **Lazy Loading**: Load full message history only when conversation is opened
- **Archival**: Move old conversations to separate table after 30 days

---

## Security Considerations

### Data Access Control
- **Document**: Public read (no sensitive data), admin-only write
- **ChatHistory**: User can only read/write their own conversations
- **UserContext**: User can only access their own context, never exposed in API responses

### Data Sanitization
- **User Input**: Sanitize before embedding generation and LLM prompts
- **LLM Output**: Filter responses to prevent leaked system prompts
- **Metadata**: Validate all metadata fields to prevent injection

### Privacy
- **Guest Conversations**: Auto-delete after 24 hours
- **User Conversations**: Retained for 30 days, then archived
- **Personal Data**: UserContext never stored in ChatHistory, only injected at runtime

---

## Summary

Data model designed to support all functional requirements with:
- **Document**: Vector-indexed knowledge base with rich metadata
- **ChatHistory**: Conversation persistence with message arrays
- **UserContext**: Runtime aggregation of user-specific data
- **ChatMessage**: Structured message format with metadata

All entities have proper validation, indexes, and security controls. Ready for API contract definition.
