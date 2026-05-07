# Implementation Plan: AI-Powered Gym Support Chatbot

**Branch**: `001-ai-chatbot-rag` | **Date**: 2026-05-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-chatbot-rag/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a professional, fast, and intelligent RAG-powered AI chatbot that provides 24/7 support to gym members. The chatbot will answer general queries (gym timings, plans, trainers, facilities) and personalized queries (membership expiry, remaining days, current plan) using retrieval-augmented generation. Technical approach: PostgreSQL with pgvector for vector storage, Cohere for embeddings, Groq/Gemini for LLM inference, Vercel AI SDK for streaming responses, and LangChain.js for orchestration. Target response time: <2 seconds for 95% of queries.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+, Next.js 15 (App Router)  
**Primary Dependencies**: 
- Vercel AI SDK (streaming chat responses)
- LangChain.js (RAG orchestration)
- Cohere SDK (embed-v4.0 for embeddings)
- Groq SDK (Llama 3.1 70B for LLM inference, free tier)
- Prisma ORM (database access)
- pgvector extension (vector similarity search)
- Zod (input validation)
- React Query (client-side state management)

**Storage**: PostgreSQL (Neon) with pgvector extension for vector embeddings  
**Testing**: Jest (unit tests), React Testing Library (component tests), Playwright (E2E tests)  
**Target Platform**: Web application (Next.js App Router), deployed on Railway/Vercel  
**Project Type**: Web (frontend + backend API routes)  
**Performance Goals**: 
- <2 seconds response time for 95% of chat queries
- Support 100 concurrent users
- Vector similarity search <500ms
- Streaming response latency <100ms for first token

**Constraints**: 
- Free tier friendly: <$50/month operational costs
- Cohere free tier: 1000 API calls/month for embeddings
- Groq free tier: rate limits apply
- Rate limiting: 10 requests/minute per user
- Knowledge base size: ~1000 documents initially

**Scale/Scope**: 
- MVP: General queries + personalized member data
- Knowledge base: Gym plans, trainers, timings, FAQs, workout guides
- User base: Single gym location, ~500 active members
- Conversation history: Last 30 days per user
- Multilingual: English + Urdu support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Security-First Development ✅
**Compliance**:
- JWT authentication integration for personalized queries (reuse existing auth middleware)
- Input sanitization for all user messages to prevent prompt injection attacks
- Rate limiting: 10 requests/minute per user (implement middleware)
- Environment variables for all API keys (Cohere, Groq, Cloudinary)
- Authorization checks: users can only access their own membership data
- CORS configured for trusted frontend origin
- Prisma ORM for parameterized queries (prevents SQL injection)

**Special Attention**: Prompt injection is a unique security concern for LLM applications. System prompt must include guardrails, and user inputs must be sanitized before being passed to the LLM.

### II. Type Safety & Validation ✅
**Compliance**:
- TypeScript strict mode enabled throughout
- Zod schemas for:
  - Chat message validation (frontend + backend)
  - Knowledge base document ingestion
  - User context retrieval
  - API request/response types
- Prisma schema for Document and ChatHistory models
- Shared types between frontend and backend for chat messages
- No `any` types except for LangChain.js interfaces (will be documented)

**Special Attention**: Vector embeddings are `number[]` type, need proper typing for pgvector operations.

### III. User Experience Excellence ✅
**Compliance**:
- Floating chat widget with smooth animations (Framer Motion)
- Streaming responses with typing indicator (Vercel AI SDK `useChat` hook)
- Loading states for message sending and retrieval
- Error messages: "I couldn't process that request. Please try again." with retry option
- Toast notifications for rate limit exceeded, network errors
- Responsive design: mobile-first chat widget (tested at 375px, 768px, 1440px)
- Markdown rendering for formatted responses (workout plans, lists)
- Accessibility: ARIA labels, keyboard navigation (Escape to close, Enter to send)
- Dark/Light mode support (respects user theme preference)

**Special Attention**: Streaming responses require careful error handling mid-stream. Need fallback for connection interruptions.

### IV. API Contract Integrity ✅
**Compliance**:
- API endpoints with explicit contracts:
  - `POST /api/v1/chat` - Streaming chat endpoint
    - Request: `{ message: string, userId?: string, conversationId?: string }`
    - Response: Server-Sent Events stream with `{ type: 'token' | 'done' | 'error', content: string }`
  - `POST /api/v1/ingest` - Admin knowledge base update (protected)
    - Request: `{ documents: Array<{ content: string, metadata: object }> }`
    - Response: `{ success: true, data: { ingested: number } }`
  - `GET /api/v1/chat/history` - User chat history (protected)
    - Request: Query params `{ userId: string, limit?: number, offset?: number }`
    - Response: `{ success: true, data: { conversations: Array<Conversation> } }`
- Consistent error format: `{ success: false, error: string, code?: string }`
- HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 429 (rate limit), 500 (server error)
- Versioning: `/api/v1/...` for future-proofing

**Special Attention**: Streaming endpoint uses SSE, not standard JSON response. Contract must document event types and data format.

### V. Test-Driven Development (TDD) ✅
**Compliance**:
- Critical paths requiring tests:
  - Vector similarity search accuracy (retrieve relevant documents)
  - Personalization logic (correct user data injection)
  - Chat streaming functionality (tokens arrive in order)
  - Rate limiting enforcement (blocks after 10 requests/min)
  - Knowledge base ingestion (embeddings generated correctly)
  - Authentication integration (only logged-in users get personal data)
  - Error handling (graceful degradation when LLM unavailable)
- Test types:
  - Unit: Embedding generation, context injection, prompt construction
  - Integration: API endpoints, database queries, vector search
  - E2E: Full chat flow from widget to response

**Special Attention**: Testing LLM responses is non-deterministic. Use mock responses for unit tests, real API calls for integration tests with assertion on response structure (not exact content).

### VI. Performance & Scalability ✅
**Compliance**:
- Database indexes:
  - `Document.embedding` - pgvector index for similarity search (IVFFlat or HNSW)
  - `ChatHistory.userId` - B-tree index for user history queries
  - `ChatHistory.createdAt` - B-tree index for time-based queries
- Frontend optimizations:
  - Lazy load chat widget (only when user clicks)
  - Code splitting for LangChain.js dependencies
  - React Query caching for chat history (staleTime: 5 minutes)
- Backend optimizations:
  - Connection pooling configured in Prisma
  - Vector search limited to top 5 results (k=5)
  - Pagination for chat history (default 20 messages)
- Performance targets:
  - Vector similarity search: <500ms
  - First token latency: <100ms (streaming)
  - Full response: <2 seconds for 95% of queries
  - Concurrent users: 100 (tested with load testing)

**Special Attention**: pgvector performance degrades with large datasets. Monitor query times and consider approximate nearest neighbor (ANN) algorithms (HNSW) if dataset grows beyond 10k documents.

### Gate Status: ✅ PASS (Pre-Design)

All constitution principles are satisfied. No violations requiring justification. Special attention areas documented for implementation phase.

### Post-Design Validation: ✅ PASS

**Re-evaluated after Phase 1 design (data-model.md, contracts/, quickstart.md)**

- **Security-First**: ✅ Data model includes authorization checks, API contracts specify JWT authentication, input validation schemas defined
- **Type Safety**: ✅ Zod schemas defined for all entities, TypeScript types documented, Prisma schema enforces type safety
- **UX Excellence**: ✅ Streaming API contract ensures real-time feedback, error responses are user-friendly, mobile-responsive design documented
- **API Contract Integrity**: ✅ OpenAPI 3.0 contracts defined for all endpoints, consistent error format, proper HTTP status codes
- **TDD**: ✅ Test strategy documented in quickstart.md, critical paths identified for unit/integration/E2E tests
- **Performance**: ✅ Vector indexes specified, pagination documented, caching strategy defined, performance targets measurable

**Conclusion**: Design maintains full compliance with constitution. No new violations introduced. Ready for task breakdown phase (`/sp.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-chatbot-rag/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── chat-api.yaml    # POST /api/v1/chat contract (SSE streaming)
│   ├── ingest-api.yaml  # POST /api/v1/ingest contract
│   └── history-api.yaml # GET /api/v1/chat/history contract
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── chat.model.ts           # ChatHistory Prisma model extensions
│   ├── services/
│   │   ├── embedding.service.ts    # Cohere embedding generation
│   │   ├── vector.service.ts       # pgvector similarity search
│   │   ├── rag.service.ts          # RAG orchestration (retrieval + generation)
│   │   └── chat.service.ts         # Chat history management
│   ├── controllers/
│   │   ├── chat.controller.ts      # POST /api/v1/chat (streaming)
│   │   ├── ingest.controller.ts    # POST /api/v1/ingest (admin)
│   │   └── history.controller.ts   # GET /api/v1/chat/history
│   ├── middleware/
│   │   └── rate-limit.middleware.ts # Rate limiting (10 req/min per user)
│   ├── routes/
│   │   └── chat.routes.ts          # Chat API routes
│   └── utils/
│       ├── prompt.utils.ts         # System prompt construction
│       └── sanitize.utils.ts       # Input sanitization for prompt injection
├── prisma/
│   ├── schema.prisma               # Document and ChatHistory models
│   └── migrations/
│       └── xxx_add_vector_support/ # pgvector extension + Document table
└── scripts/
    ├── ingest.ts                   # Knowledge base ingestion script
    └── seed-knowledge.ts           # Initial knowledge base seeding

frontend/
├── app/
│   └── api/                        # Next.js API routes (if needed for client-side calls)
├── components/
│   └── chat/
│       ├── ChatWidget.tsx          # Floating chat button (bottom-right)
│       ├── ChatWindow.tsx          # Chat modal/drawer UI
│       ├── ChatMessage.tsx         # Individual message component
│       └── ChatInput.tsx           # Message input with send button
├── lib/
│   └── services/
│       └── chat.service.ts         # Frontend chat API client
├── hooks/
│   └── useChat.ts                  # Vercel AI SDK useChat hook wrapper
└── types/
    └── chat.types.ts               # Shared chat types (Message, Conversation)

tests/
├── backend/
│   ├── unit/
│   │   ├── embedding.service.test.ts
│   │   ├── vector.service.test.ts
│   │   └── rag.service.test.ts
│   └── integration/
│       ├── chat-api.test.ts
│       ├── ingest-api.test.ts
│       └── history-api.test.ts
└── frontend/
    ├── components/
    │   └── ChatWidget.test.tsx
    └── e2e/
        └── chat-flow.spec.ts       # Playwright E2E test
```

**Structure Decision**: Web application structure (Option 2) selected because this is a full-stack feature with both backend API services (RAG, embeddings, vector search) and frontend UI components (chat widget). The backend handles the heavy lifting (vector search, LLM inference), while the frontend provides the user interface with streaming support. This separation allows independent scaling and deployment of frontend (Vercel) and backend (Railway).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: N/A - No constitution violations detected. All principles satisfied without requiring exceptions or justifications.
