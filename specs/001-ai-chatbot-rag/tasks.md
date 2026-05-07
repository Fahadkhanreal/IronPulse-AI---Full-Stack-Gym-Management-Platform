# Implementation Tasks: AI-Powered Gym Support Chatbot

**Feature**: 001-ai-chatbot-rag  
**Branch**: `001-ai-chatbot-rag`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Generated**: 2026-05-06

---

## Overview

This document breaks down the RAG-powered chatbot implementation into testable, executable tasks organized by user story. Each phase represents a complete, independently testable increment.

**MVP Scope**: Phase 3 (User Story 1 - General Queries) delivers the core chatbot functionality.

**Total Tasks**: 87 tasks across 8 phases

---

## Task Format

```
- [ ] T### [P] [Story] Description with file path
```

- **T###**: Sequential task ID
- **[P]**: Parallelizable (can run concurrently with other [P] tasks in same phase)
- **[Story]**: User story label (US1, US2, etc.) - only for user story phases
- **Description**: Clear action with exact file path

---

## Phase 1: Setup & Environment (5 tasks)

**Goal**: Initialize project structure and configure development environment.

**Independent Test**: Environment variables loaded, dependencies installed, project structure matches plan.

### Tasks

- [x] T001 Install backend dependencies: `npm install cohere-ai groq-sdk ai @langchain/community zod` in backend/
- [x] T002 Install frontend dependencies: `npm install ai framer-motion react-markdown remark-gfm` in frontend/
- [x] T003 Add environment variables to backend/.env: COHERE_API_KEY, GROQ_API_KEY, COHERE_MODEL, GROQ_MODEL
- [x] T004 Create backend directory structure: src/services/, src/controllers/, src/middleware/, src/utils/, scripts/
- [x] T005 Create frontend directory structure: components/chat/, hooks/, lib/services/, types/

---

## Phase 2: Foundational - Database & Vector Infrastructure (12 tasks)

**Goal**: Set up pgvector extension, Prisma models, and core embedding/vector services needed by all user stories.

**Independent Test**: 
- pgvector extension enabled
- Document and ChatHistory tables created with indexes
- Can generate embeddings and store vectors
- Vector similarity search returns results

**Blocking**: All user story phases depend on this phase completing.

### Tasks

- [x] T006 Enable pgvector extension in PostgreSQL: `CREATE EXTENSION IF NOT EXISTS vector;`
- [x] T007 Add Document model to backend/prisma/schema.prisma with vector(1024) embedding column
- [x] T008 Add ChatHistory model to backend/prisma/schema.prisma with JSON messages field
- [x] T009 Create Prisma migration: `npx prisma migrate dev --name add_chatbot_tables`
- [x] T010 Generate Prisma client: `npx prisma generate`
- [x] T011 [P] Create Zod schemas in backend/src/types/chat.types.ts for Document, ChatMessage, ChatRequest
- [x] T012 [P] Implement Cohere embedding service in backend/src/services/embedding.service.ts
- [x] T013 [P] Implement vector similarity search in backend/src/services/vector.service.ts
- [x] T014 [P] Create input sanitization utility in backend/src/utils/sanitize.utils.ts
- [x] T015 [P] Create system prompt builder in backend/src/utils/prompt.utils.ts
- [x] T016 Test embedding generation: Create test script that generates embedding for sample text
- [x] T017 Test vector search: Insert test documents and verify similarity search returns relevant results

---

## Phase 3: User Story 1 (P1) - General Gym Information Queries (18 tasks)

**User Story**: A gym visitor or member wants to quickly get answers to common questions about gym facilities, timings, plans, and trainers without waiting for staff assistance.

**Goal**: Implement core RAG chatbot that answers general gym questions using knowledge base retrieval.

**Independent Test**: 
- User can ask "What are your gym timings?" and receive accurate response in <2 seconds
- User can ask "What membership plans do you offer?" and receive plan details
- User can ask "Tell me about your trainers" and receive trainer information
- Responses are streamed in real-time with typing indicator
- Chat widget is accessible and responsive on mobile/desktop

**Acceptance Criteria** (from spec.md):
1. Chatbot opens and greets user when widget clicked
2. Answers gym timings accurately
3. Lists all membership plans with prices
4. Provides trainer information with specializations
5. Describes gym facilities and equipment

### Tasks

#### Tests (TDD - Write First)

- [ ] T018 [P] [US1] Create unit test for embedding.service.ts: Test batch embedding generation
- [ ] T019 [P] [US1] Create unit test for vector.service.ts: Test similarity search with mock data
- [ ] T020 [P] [US1] Create unit test for rag.service.ts: Test document retrieval and context injection
- [ ] T021 [P] [US1] Create integration test for POST /api/v1/chat in tests/backend/integration/chat-api.test.ts

#### Backend Implementation

- [x] T022 [US1] Implement RAG service in backend/src/services/rag.service.ts (retrieval + generation pipeline)

---

## Phase 3: User Story 1 (P1) - General Gym Information Queries (18 tasks)

**User Story**: A gym visitor or member wants to quickly get answers to common questions about gym facilities, timings, plans, and trainers without waiting for staff assistance.

**Goal**: Implement core RAG chatbot that answers general gym questions using knowledge base retrieval.

**Independent Test**: 
- User can ask "What are your gym timings?" and receive accurate response in <2 seconds
- User can ask "What membership plans do you offer?" and receive plan details
- User can ask "Tell me about your trainers" and receive trainer information
- Responses are streamed in real-time with typing indicator
- Chat widget is accessible and responsive on mobile/desktop

**Acceptance Criteria** (from spec.md):
1. Chatbot opens and greets user when widget clicked
2. Answers gym timings accurately
3. Lists all membership plans with prices
4. Provides trainer information with specializations
5. Describes gym facilities and equipment

### Tasks

#### Tests (TDD - Write First)

- [ ] T018 [P] [US1] Create unit test for embedding.service.ts: Test batch embedding generation
- [ ] T019 [P] [US1] Create unit test for vector.service.ts: Test similarity search with mock data
- [ ] T020 [P] [US1] Create unit test for rag.service.ts: Test document retrieval and context injection
- [ ] T021 [P] [US1] Create integration test for POST /api/v1/chat in tests/backend/integration/chat-api.test.ts

#### Backend Implementation

- [x] T022 [US1] Implement RAG service in backend/src/services/rag.service.ts (retrieval + generation pipeline)
- [x] T023 [US1] Implement chat controller in backend/src/controllers/chat.controller.ts (streaming SSE endpoint)
- [x] T024 [US1] Create chat routes in backend/src/routes/chat.routes.ts (POST /api/v1/chat)
- [x] T025 [US1] Register chat routes in backend/src/server.ts
- [x] T026 [P] [US1] Implement rate limiting middleware in backend/src/middleware/rate-limit.middleware.ts (10 req/min)

#### Knowledge Base Ingestion

- [x] T027 [US1] Create knowledge base seeding script in backend/scripts/seed-knowledge.ts
- [x] T028 [US1] Prepare gym timings content and ingest into Document table
- [x] T029 [US1] Ingest membership plans from database into Document table with metadata
- [x] T030 [US1] Ingest trainers from database into Document table with metadata
- [x] T031 [US1] Ingest gym facilities and equipment information into Document table

#### Frontend Implementation

- [x] T032 [P] [US1] Create chat types in frontend/types/chat.types.ts (Message, Conversation interfaces)
- [x] T033 [P] [US1] Implement chat API client in frontend/lib/api/chat.api.ts
- [x] T034 [US1] Create ChatWidget component in frontend/components/chat/ChatWidget.tsx (floating button)
- [x] T035 [US1] Create ChatWindow component in frontend/components/chat/ChatWindow.tsx (modal with messages)
- [x] T036 [US1] Create ChatMessage component in frontend/components/chat/ChatMessage.tsx (markdown rendering)
- [x] T037 [US1] Create ChatInput component in frontend/components/chat/ChatInput.tsx (input with send button)
- [x] T038 [US1] Integrate ChatWidget into frontend/app/layout.tsx

#### E2E Testing

- [ ] T039 [US1] Create E2E test in tests/frontend/e2e/chat-flow.spec.ts: Test full chat flow from widget to response

---

## Phase 4: User Story 3 (P1) - Fitness Advice and Workout Guidance (10 tasks)

**User Story**: A gym member or visitor wants to get personalized fitness advice, workout plans, and exercise recommendations based on their goals.

**Goal**: Extend knowledge base with workout guides and fitness advice, enhance system prompt for fitness coaching.

**Independent Test**:
- User can ask "I want to lose weight, what should I do?" and receive structured advice
- User can ask "Give me a chest workout" and receive exercise list with sets/reps
- User can ask "I'm a beginner, where should I start?" and receive beginner-friendly guidance
- Responses include proper form guidance and common mistakes

**Acceptance Criteria** (from spec.md):
1. Provides weight loss plan with diet and exercise recommendations
2. Lists specific exercises with sets, reps, and form guidance
3. Provides beginner-friendly workout routines
4. Explains proper form and common mistakes
5. Provides dietary guidelines for fitness goals

**Dependencies**: Requires Phase 3 (US1) complete - builds on existing RAG infrastructure.

### Tasks

#### Tests (TDD - Write First)

- [ ] T040 [P] [US3] Create unit test for fitness advice retrieval: Test workout guide document retrieval
- [ ] T041 [P] [US3] Create integration test for fitness queries in tests/backend/integration/chat-api.test.ts

#### Knowledge Base Expansion

- [ ] T042 [US3] Prepare workout guides content (beginner, intermediate, advanced routines)
- [ ] T043 [US3] Ingest workout guides into Document table with category='workout'
- [ ] T044 [US3] Prepare exercise database (exercises with form, sets, reps, muscle groups)
- [ ] T045 [US3] Ingest exercise database into Document table
- [ ] T046 [US3] Prepare fitness advice content (weight loss, muscle building, endurance)
- [ ] T047 [US3] Ingest fitness advice into Document table

#### System Prompt Enhancement

- [ ] T048 [US3] Update system prompt in backend/src/utils/prompt.utils.ts to include fitness coaching guidelines
- [ ] T049 [US3] Add fitness-specific response formatting (exercise lists, workout plans structure)

---

## Phase 5: User Story 2 (P2) - Personalized Member Information (12 tasks)

**User Story**: A logged-in gym member wants to check their personal membership details, package expiry date, and remaining days without navigating to dashboard.

**Goal**: Integrate user authentication, retrieve user context, and inject personalized data into chat responses.

**Independent Test**:
- Logged-in user can ask "What is my current plan?" and receive their plan name
- Logged-in user can ask "When does my membership expire?" and receive exact date
- Logged-in user can ask "How many days are left?" and receive calculated remaining days
- Non-logged-in user asking personal questions receives prompt to log in
- User can only access their own membership data (authorization enforced)

**Acceptance Criteria** (from spec.md):
1. Displays active membership plan name and details
2. Shows exact expiry date
3. Calculates and displays remaining days
4. Informs expired members and suggests renewal
5. Prompts non-logged-in users to log in for personal queries

**Dependencies**: Requires Phase 3 (US1) complete - extends chat API with personalization.

### Tasks

#### Tests (TDD - Write First)

- [ ] T050 [P] [US2] Create unit test for user context service: Test membership data retrieval
- [ ] T051 [P] [US2] Create integration test for personalized queries in tests/backend/integration/chat-api.test.ts
- [ ] T052 [P] [US2] Create integration test for authorization: Verify users can't access other users' data

#### Backend Implementation

- [ ] T053 [US2] Create user context service in backend/src/services/user-context.service.ts
- [ ] T054 [US2] Implement getUserMembership function to fetch subscription data
- [ ] T055 [US2] Implement calculateRemainingDays function with status logic (active/expiring_soon/expired)
- [ ] T056 [US2] Update RAG service to inject user context when userId provided
- [ ] T057 [US2] Update chat controller to extract userId from JWT token
- [ ] T058 [US2] Add authorization check: Verify authenticated user matches requested userId
- [ ] T059 [US2] Update system prompt to handle personalized queries with user context

#### Frontend Integration

- [ ] T060 [US2] Update chat API client to include userId from auth context
- [ ] T061 [US2] Update ChatWidget to pass authenticated user ID to chat API

---

## Phase 6: User Story 4 (P3) - Conversation History and Context (11 tasks)

**User Story**: A logged-in member wants to review previous conversations and have the chatbot remember context from earlier in the conversation.

**Goal**: Implement conversation persistence, history retrieval, and context maintenance within sessions.

**Independent Test**:
- User can view list of previous conversations
- User can reopen a conversation and see all previous messages
- Chatbot remembers context within a single conversation (follow-up questions work)
- Guest users have session-only history (cleared on close)
- User can delete conversation history

**Acceptance Criteria** (from spec.md):
1. Logged-in members can view conversation history
2. Chatbot understands context from previous messages in same session
3. Conversation persists when user closes and reopens chatbot
4. Guest users have session-only storage (no persistence)

**Dependencies**: Requires Phase 3 (US1) and Phase 5 (US2) complete - adds persistence layer.

### Tasks

#### Tests (TDD - Write First)

- [ ] T062 [P] [US4] Create unit test for chat history service: Test conversation save/load
- [ ] T063 [P] [US4] Create integration test for GET /api/v1/chat/history in tests/backend/integration/history-api.test.ts

#### Backend Implementation

- [ ] T064 [US4] Implement chat history service in backend/src/services/chat.service.ts
- [ ] T065 [US4] Implement saveConversation function to persist messages to ChatHistory table
- [ ] T066 [US4] Implement getConversationHistory function with pagination
- [ ] T067 [US4] Create history controller in backend/src/controllers/history.controller.ts
- [ ] T068 [US4] Create history routes in backend/src/routes/chat.routes.ts (GET /api/v1/chat/history)
- [ ] T069 [US4] Update chat controller to save messages after each response
- [ ] T070 [US4] Update RAG service to include last 5 messages as conversation context

#### Frontend Implementation

- [ ] T071 [US4] Update chat API client to fetch conversation history
- [ ] T072 [US4] Update ChatWindow to display conversation history on open

---

## Phase 7: User Story 5 (P3) - Multilingual Support (8 tasks)

**User Story**: A user who is more comfortable in Urdu wants to interact with the chatbot in their preferred language.

**Goal**: Implement language detection, multilingual embeddings, and language-aware responses.

**Independent Test**:
- User sends message in Urdu and receives response in Urdu
- User sends message in English and receives response in English
- User switches languages mid-conversation and chatbot adapts
- Mixed language messages are understood and responded to appropriately

**Acceptance Criteria** (from spec.md):
1. Responds in Urdu when user sends Urdu message
2. Responds in English when user sends English message
3. Adapts to language switch mid-conversation
4. Understands mixed language (Urdu + English) messages

**Dependencies**: Requires Phase 3 (US1) complete - adds language detection layer.

### Tasks

#### Tests (TDD - Write First)

- [ ] T073 [P] [US5] Create unit test for language detection utility
- [ ] T074 [P] [US5] Create integration test for multilingual queries in tests/backend/integration/chat-api.test.ts

#### Backend Implementation

- [ ] T075 [US5] Create language detection utility in backend/src/utils/language.utils.ts
- [ ] T076 [US5] Update embedding service to use embed-multilingual-v4.0 for Urdu content
- [ ] T077 [US5] Update RAG service to detect user message language
- [ ] T078 [US5] Update system prompt to include language instruction based on detected language
- [ ] T079 [US5] Ingest Urdu translations of key gym information into Document table

#### Frontend Enhancement

- [ ] T080 [US5] Update ChatInput to support Urdu text input (RTL support if needed)

---

## Phase 8: Polish & Cross-Cutting Concerns (7 tasks)

**Goal**: Admin features, security hardening, performance optimization, and final testing.

**Independent Test**:
- Admin can ingest new documents via admin dashboard
- Rate limiting blocks requests after 10/minute
- Prompt injection attempts are sanitized and blocked
- All 20+ test scenarios from spec pass
- Performance targets met (<2s response, <500ms vector search)

### Tasks

#### Admin Features

- [ ] T081 Create admin knowledge base management page in frontend/app/admin/knowledge-base/page.tsx
- [ ] T082 Implement ingest controller in backend/src/controllers/ingest.controller.ts (POST /api/v1/ingest)
- [ ] T083 Create ingest routes in backend/src/routes/chat.routes.ts with admin auth middleware

#### Security & Performance

- [ ] T084 Implement prompt injection detection in backend/src/utils/sanitize.utils.ts
- [ ] T085 Add response filtering to remove leaked system prompts in backend/src/utils/prompt.utils.ts
- [ ] T086 Optimize vector search: Add IVFFlat index with lists=100 to Document.embedding

#### Final Testing

- [ ] T087 Run full test suite and verify all acceptance criteria from spec.md pass

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Order)

1. **Phase 1** (Setup) → **Phase 2** (Foundational) → **Phase 3** (US1)
2. **Phase 3** (US1) → **Phase 4** (US3) [extends knowledge base]
3. **Phase 3** (US1) → **Phase 5** (US2) [adds personalization]
4. **Phase 3** (US1) + **Phase 5** (US2) → **Phase 6** (US4) [adds persistence]
5. **Phase 3** (US1) → **Phase 7** (US5) [adds multilingual]
6. All phases → **Phase 8** (Polish)

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T011, T012, T013, T014, T015 can run in parallel (different files)

**Within Phase 3 (US1)**:
- T018, T019, T020, T021 (tests) can run in parallel
- T026 (rate limiting) can run parallel with T022-T025 (chat API)
- T032, T033 (frontend types/client) can run parallel with backend tasks
- T027-T031 (knowledge base) can run parallel with T022-T026 (API implementation)

**Within Phase 4 (US3)**:
- T040, T041 (tests) can run in parallel
- T042-T047 (knowledge base ingestion) can run in parallel

**Within Phase 5 (US2)**:
- T050, T051, T052 (tests) can run in parallel

**Within Phase 6 (US4)**:
- T062, T063 (tests) can run in parallel

**Within Phase 7 (US5)**:
- T073, T074 (tests) can run in parallel

---

## Implementation Strategy

### MVP Delivery (Phase 3 Only)

**Scope**: User Story 1 - General Gym Information Queries

**Delivers**:
- Functional chatbot answering gym timings, plans, trainers, facilities
- Streaming responses with real-time typing
- Mobile-responsive chat widget
- Vector-based knowledge retrieval

**Estimated Effort**: 18 tasks (T018-T039)

**Validation**: User can have complete conversation about gym information without human intervention.

### Incremental Delivery

1. **MVP** (Phase 3): General queries chatbot
2. **MVP + Fitness** (Phase 3 + 4): Add workout guidance
3. **Personalized** (Phase 3 + 4 + 5): Add member-specific data
4. **Full Feature** (Phase 3-7): Add history and multilingual
5. **Production Ready** (Phase 3-8): Add admin tools and security hardening

---

## Testing Strategy

### Unit Tests (Per Phase)
- Embedding generation (Phase 2)
- Vector similarity search (Phase 2)
- RAG pipeline (Phase 3)
- User context retrieval (Phase 5)
- Chat history persistence (Phase 6)
- Language detection (Phase 7)

### Integration Tests (Per Phase)
- POST /api/v1/chat endpoint (Phase 3)
- Fitness advice queries (Phase 4)
- Personalized queries with auth (Phase 5)
- GET /api/v1/chat/history endpoint (Phase 6)
- Multilingual queries (Phase 7)

### E2E Tests
- Full chat flow from widget to response (Phase 3)
- Conversation history flow (Phase 6)

### Performance Tests
- Vector search latency <500ms (Phase 2)
- Chat response time <2s for 95% of queries (Phase 3)
- 100 concurrent users (Phase 8)

---

## Success Criteria Mapping

Each phase maps to success criteria from spec.md:

- **SC-001** (95% queries <2s): Phase 3, validated in Phase 8
- **SC-002** (80% resolution without human): Phase 3 + 4
- **SC-003** (100% accuracy for personal data): Phase 5
- **SC-004** (100 concurrent users): Phase 8
- **SC-005** (4/5 star satisfaction): Phase 8 (user testing)
- **SC-006** (50% ticket reduction): Phase 3 + 4 (measured post-deployment)
- **SC-007** (70% task completion): Phase 3 + 4
- **SC-008** (Context for 10 messages): Phase 6
- **SC-009** (Mobile effectiveness): Phase 3 (responsive design)
- **SC-010** (Costs <$50/month): Phase 2 (free tier validation)

---

## Notes

- All file paths are relative to repository root
- Tasks marked [P] can be executed in parallel within their phase
- Each phase should be completed and tested before moving to next
- TDD approach: Write tests first (T0XX tasks), then implementation
- Constitution compliance validated at each phase completion
- Performance targets monitored throughout implementation

---

**Ready for Implementation**: Run `/sp.red` to start TDD cycle with first failing test.
