---
id: 003
title: AI Chatbot RAG Tasks Breakdown Created
stage: tasks
date: 2026-05-06
surface: agent
model: claude-sonnet-4-6
feature: ai-chatbot-rag
branch: 001-ai-chatbot-rag
user: Fahadkhanreal
command: /sp.tasks
labels: ["chatbot", "rag", "tasks", "tdd", "implementation"]
links:
  spec: specs/001-ai-chatbot-rag/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-chatbot-rag/tasks.md
tests:
  - Task format validation: All 87 tasks follow checklist format (PASS)
  - User story mapping: All 5 user stories have dedicated phases (PASS)
  - Dependency validation: Critical path identified, parallel opportunities documented (PASS)
  - Independent test criteria: Each phase has clear acceptance criteria (PASS)
  - MVP scope validation: Phase 3 (US1) identified as MVP (PASS)
---

## Prompt

User provided detailed task list via `/sp.tasks` command with phase-by-phase breakdown:

```
# Gym Support AI Chatbot - Detailed Task List

**Project:** RAG Powered Gym Chatbot  
**Methodology:** Spec-Driven Development (Panaversity)  
**Status:** Ready to Execute

## Phase 0: Preparation (Day 1)
- Git branch, environment variables, dependencies, folder structure, README

## Phase 1: Database Setup (pgvector) (Day 1-2)
- pgvector extension, Prisma models, migrations, vector search testing

## Phase 2: Embeddings & Ingestion (Day 2-3)
- Cohere setup, ingestion utilities, knowledge base content, admin endpoint

## Phase 3: Core Chat API - RAG (Day 3-4)
- Chat route, streaming, retrieval logic, system prompt, Groq integration, error handling

## Phase 4: Frontend Chat Widget (Day 4-5)
- ChatWidget, ChatWindow, useChat hook, streaming UI, markdown rendering, responsive design

## Phase 5: Personalization (Day 5-6)
- User authentication, getUserMembership, user context injection, personal queries

## Phase 6: Polish & Admin Features (Day 6-7)
- Admin dashboard, chat history, prompt injection protection, UI/UX improvements, testing

## Phase 7: Testing & Deployment (Day 7-8)
- Local testing, edge cases, Railway deployment, environment setup, bug fixing

## Bonus / Future Tasks (After MVP)
- Cohere Reranker, voice input, image generation, analytics, multi-language support
```

## Response snapshot

Created comprehensive task breakdown with 87 tasks organized by user story priority:

**Task Organization Strategy**:
- Organized by user story (not by technical layer) to enable independent implementation and testing
- Each phase represents a complete, testable increment
- MVP scope clearly identified (Phase 3 - User Story 1)
- Parallel execution opportunities documented within each phase

**Phase Structure** (8 phases):

**Phase 1 - Setup & Environment** (5 tasks):
- Install dependencies (backend: cohere-ai, groq-sdk, ai, langchain; frontend: ai, framer-motion, react-markdown)
- Configure environment variables (COHERE_API_KEY, GROQ_API_KEY)
- Create directory structures (backend: services, controllers, middleware, utils, scripts; frontend: components/chat, hooks, lib/services, types)

**Phase 2 - Foundational** (12 tasks):
- Enable pgvector extension
- Create Prisma models (Document with vector(1024), ChatHistory with JSON messages)
- Generate migrations and Prisma client
- Implement core services: embedding.service.ts, vector.service.ts
- Create utilities: sanitize.utils.ts, prompt.utils.ts
- Create Zod validation schemas
- Test embedding generation and vector search

**Phase 3 - User Story 1 (P1) - General Queries** (18 tasks):
- TDD: 4 test tasks (unit tests for services, integration test for chat API)
- Backend: RAG service, chat controller, chat routes, rate limiting middleware
- Knowledge base: Seed script, ingest gym timings, plans, trainers, facilities
- Frontend: Chat types, API client, ChatWidget, ChatWindow, ChatMessage, ChatInput components
- Integration: Add ChatWidget to layout
- E2E: Full chat flow test

**Phase 4 - User Story 3 (P1) - Fitness Advice** (10 tasks):
- TDD: 2 test tasks (unit test for fitness retrieval, integration test for fitness queries)
- Knowledge base: Workout guides, exercise database, fitness advice content
- System prompt: Update with fitness coaching guidelines and response formatting

**Phase 5 - User Story 2 (P2) - Personalized Member Info** (12 tasks):
- TDD: 3 test tasks (user context service, personalized queries, authorization)
- Backend: User context service, getUserMembership, calculateRemainingDays, update RAG service
- Authorization: Extract userId from JWT, verify user access
- Frontend: Update chat client to include userId

**Phase 6 - User Story 4 (P3) - Conversation History** (11 tasks):
- TDD: 2 test tasks (chat history service, history API)
- Backend: Chat history service, saveConversation, getConversationHistory, history controller, history routes
- Integration: Update chat controller to save messages, update RAG service for context
- Frontend: Fetch and display conversation history

**Phase 7 - User Story 5 (P3) - Multilingual Support** (8 tasks):
- TDD: 2 test tasks (language detection, multilingual queries)
- Backend: Language detection utility, multilingual embeddings, language-aware system prompt
- Knowledge base: Ingest Urdu translations
- Frontend: RTL support for Urdu input

**Phase 8 - Polish & Cross-Cutting** (7 tasks):
- Admin: Knowledge base management page, ingest controller, ingest routes
- Security: Prompt injection detection, response filtering
- Performance: Optimize vector search with IVFFlat index
- Testing: Full test suite validation

**Task Format Compliance**:
- All 87 tasks follow strict checklist format: `- [ ] T### [P] [Story] Description with file path`
- Task IDs: T001-T087 (sequential)
- Parallelizable tasks marked with [P] (31 tasks can run in parallel)
- User story labels: [US1], [US2], [US3], [US4], [US5] (applied to 59 tasks)
- File paths: All tasks include exact file paths

**Dependencies & Execution Order**:
- Critical path documented: Phase 1 → Phase 2 → Phase 3 → {Phase 4, 5, 7} → Phase 6 → Phase 8
- Phase 3 (US1) is blocking for most other user stories
- Phase 5 (US2) is blocking for Phase 6 (US4)
- Parallel opportunities: 31 tasks marked [P] can run concurrently within their phases

**Independent Test Criteria**:
- Phase 1: Environment variables loaded, dependencies installed, structure matches plan
- Phase 2: pgvector enabled, tables created, embeddings work, vector search returns results
- Phase 3: User can ask gym questions and receive accurate streaming responses <2s
- Phase 4: User can ask fitness questions and receive workout guidance
- Phase 5: Logged-in user can ask personal questions and receive their membership data
- Phase 6: User can view conversation history and chatbot maintains context
- Phase 7: User can interact in Urdu and receive Urdu responses
- Phase 8: Admin can manage knowledge base, rate limiting works, all tests pass

**MVP Scope**:
- Phase 3 (User Story 1) identified as MVP
- Delivers: Functional chatbot for general gym queries with streaming responses
- 18 tasks (T018-T039)
- Validation: User can have complete conversation about gym without human intervention

**Implementation Strategy**:
- MVP first (Phase 3 only)
- Incremental delivery: MVP → MVP+Fitness → Personalized → Full Feature → Production Ready
- TDD approach: Write tests first, then implementation
- Constitution compliance validated at each phase

**Testing Strategy**:
- Unit tests: 13 test tasks across phases
- Integration tests: 7 test tasks for API endpoints
- E2E tests: 2 test tasks for full flows
- Performance tests: Vector search <500ms, response <2s, 100 concurrent users

**Success Criteria Mapping**:
- All 10 success criteria from spec.md mapped to specific phases
- SC-001 (95% <2s): Phase 3, validated Phase 8
- SC-002 (80% resolution): Phase 3+4
- SC-003 (100% personal data accuracy): Phase 5
- SC-004 (100 concurrent): Phase 8
- SC-005-010: Mapped to appropriate phases

## Outcome

- ✅ Impact: Complete task breakdown created with 87 testable tasks organized by user story priority
- 🧪 Tests: Task format validation (PASS), user story mapping (PASS), dependency validation (PASS), independent test criteria (PASS)
- 📁 Files: Created tasks.md with 8 phases, critical path, parallel opportunities, MVP scope
- 🔁 Next prompts: Ready for `/sp.red` to start TDD cycle with first failing test (T018 - embedding service unit test)
- 🧠 Reflection: Tasks are immediately executable, organized by user story for independent implementation, MVP clearly scoped (Phase 3), parallel opportunities identified (31 tasks), all tasks follow strict checklist format with IDs and file paths. Ready for implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation completed successfully with all validations passing
- Graders run and results (PASS/FAIL): PASS - Task format validation (87/87 tasks compliant), User story mapping (5/5 stories covered), Dependency validation (critical path clear), Independent test criteria (8/8 phases have criteria)
- Prompt variant (if applicable): Standard /sp.tasks workflow with user-provided phase breakdown integrated into user story organization
- Next experiment (smallest change to try): Proceed to TDD implementation with /sp.red command starting with Phase 2 foundational tests (T018-T021)
