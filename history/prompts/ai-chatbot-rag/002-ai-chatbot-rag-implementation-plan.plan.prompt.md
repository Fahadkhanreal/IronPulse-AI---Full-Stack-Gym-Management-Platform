---
id: 002
title: AI Chatbot RAG Implementation Plan Created
stage: plan
date: 2026-05-06
surface: agent
model: claude-sonnet-4-6
feature: ai-chatbot-rag
branch: 001-ai-chatbot-rag
user: Fahadkhanreal
command: /sp.plan
labels: ["chatbot", "rag", "planning", "architecture", "design"]
links:
  spec: specs/001-ai-chatbot-rag/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-chatbot-rag/plan.md
  - specs/001-ai-chatbot-rag/research.md
  - specs/001-ai-chatbot-rag/data-model.md
  - specs/001-ai-chatbot-rag/contracts/chat-api.yaml
  - specs/001-ai-chatbot-rag/contracts/ingest-api.yaml
  - specs/001-ai-chatbot-rag/contracts/history-api.yaml
  - specs/001-ai-chatbot-rag/quickstart.md
  - CLAUDE.md (updated with new technologies)
tests:
  - Constitution Check: All 6 principles validated (PASS)
  - Post-design validation: All principles maintained (PASS)
  - Technology choices validated against free tier constraints
  - API contracts validated for consistency and completeness
---

## Prompt

User provided detailed implementation plan via `/sp.plan` command with comprehensive phase breakdown:

```
# Gym Support AI Chatbot - Complete Implementation Plan

**Project:** Gym Website - RAG Powered Intelligent Chatbot  
**Methodology:** Spec-Driven Development (Panaversity)  
**Tech Stack:** Next.js + Node.js + PostgreSQL + Prisma  
**Deployment Target:** Railway  
**Prepared Date:** May 2026

## 1. Project Goal
Ek **fast, accurate, personalized aur production-ready** RAG Chatbot banana jo gym members ko 24/7 support de sake. Chatbot general sawalon ke saath personal membership details bhi handle karega.

## 2. Success Criteria
- Chatbot 2 seconds ke andar jawab de
- Accurate aur hallucination-free answers
- Personal queries sahi se handle kare (expiry, remaining days)
- Mobile + Desktop dono pe smooth experience
- Railway pe successfully deploy ho

## 3. Phase-wise Implementation Plan

### **Phase 0: Preparation (1 Day)**
- Spec finalization
- Git branch banao: `feature/rag-chatbot`
- Environment variables setup
- Project structure create karo
- All dependencies list karo

### **Phase 1: Database & Vector Setup (1-2 Days)**
- pgvector extension enable karo
- Prisma schema mein `Document` model add karo
- Vector column setup
- Migration run karo
- Test query for vector similarity
- `ChatHistory` model

### **Phase 2: Embeddings & Ingestion Pipeline (2 Days)**
- Cohere Embeddings integration (`embed-v4.0`)
- Ingestion script banao
- Knowledge base content prepare karo
- Metadata strategy
- Admin ke liye manual ingest endpoint
- Bulk ingestion function

### **Phase 3: Core Chat API (RAG) (2 Days)**
- `/api/chat` route with streaming
- Retrieval logic (pgvector similarity search)
- System prompt finalization
- Context injection
- LLM integration (Groq Llama 3.1 70B)
- Error handling & fallback

### **Phase 4: Frontend Chat Widget (1-2 Days)**
- Beautiful floating chat button
- Chat modal / drawer UI
- `useChat` hook integration
- Streaming messages
- Loading states + typing indicator
- Markdown rendering
- Responsive design

### **Phase 5: Personalization & Tools (2 Days)**
- User authentication check
- User-specific context
- Function calling / Tools integration
- Personal queries handling
- Security

### **Phase 6: Polish, Security & Optimization (1-2 Days)**
- Rate limiting
- Prompt injection protection
- Chat history (save + load)
- Knowledge base management page
- UI/UX improvements
- Testing

### **Phase 7: Testing & Deployment (1 Day)**
- Manual testing
- Edge case testing
- Railway deployment
- Environment variables setup
- Final testing

## 4. Folder Structure
[Detailed structure provided]

## 5. Recommended Tools & Services (Free Tier)
- Embeddings: Cohere embed-v4.0
- LLM: Groq (Llama 3.1 70B)
- Vector DB: PostgreSQL + pgvector
- Chat Streaming: Vercel AI SDK
- UI Components: shadcn/ui + Tailwind

## 6. Risks & Mitigation
- High Cost → Free tier models
- Slow Response → Small chunks + indexing
- Hallucination → Strong system prompt
- Deployment Issue → Local testing first
```

## Response snapshot

Created comprehensive implementation plan with complete Phase 0 and Phase 1 deliverables:

**Phase 0 - Research (research.md)**:
- 7 major technology decisions documented with rationale and alternatives
- pgvector: IVFFlat vs HNSW index selection strategy
- Cohere embed-v4.0: Chunking strategy (400 tokens), batch processing (96 texts/call)
- Groq Llama 3.1 70B: System prompt construction, streaming configuration, rate limit handling
- LangChain.js + Vercel AI SDK: RAG pipeline architecture (5-step process)
- Security: Multi-layer prompt injection defense (input sanitization, system guardrails, authorization checks, output filtering)
- Performance: Streaming architecture with SSE, caching strategy (embeddings + responses)
- Knowledge Base: Ingestion pipeline for structured/unstructured data, automatic updates

**Phase 1 - Design (data-model.md, contracts/, quickstart.md)**:
- 4 core entities defined with complete schemas:
  - Document: Vector-indexed knowledge base (1024-dim embeddings, metadata, indexes)
  - ChatHistory: Conversation persistence with message arrays
  - UserContext: Virtual entity aggregating user-specific data
  - ChatMessage: Runtime entity with metadata tracking
- Zod validation schemas for all entities
- Database migrations for pgvector extension and tables
- Performance considerations: Vector search optimization, JSON field queries, conversation history pagination
- Security: Data access control, sanitization, privacy policies

**API Contracts (OpenAPI 3.0)**:
- POST /api/v1/chat: Streaming chat endpoint with SSE, rate limiting (10 req/min), authentication optional
- POST /api/v1/ingest: Admin-only knowledge base ingestion, batch processing (100 docs/request), rate limiting (5 req/min)
- GET /api/v1/chat/history: User conversation history with pagination, rate limiting (20 req/min)
- GET /api/v1/chat/history/{conversationId}: Full conversation retrieval
- DELETE endpoints for conversation management
- Consistent error responses with status codes and error codes

**Developer Quickstart Guide**:
- Environment setup (dependencies, API keys)
- Database setup (pgvector extension, migrations)
- Knowledge base seeding script with examples
- Backend API testing (curl examples)
- Frontend integration steps
- Troubleshooting guide (7 common issues with solutions)
- Development workflow and useful commands

**Technical Context**:
- Language: TypeScript 5.x, Node.js 18+, Next.js 15 (App Router)
- Dependencies: Vercel AI SDK, LangChain.js, Cohere SDK, Groq SDK, Prisma, pgvector
- Storage: PostgreSQL (Neon) with pgvector extension
- Performance Goals: <2s response (95%), 100 concurrent users, <500ms vector search
- Constraints: <$50/month, free tier friendly
- Scale: ~500 active members, ~1000 documents, 30-day conversation retention

**Constitution Validation**:
- Pre-design: All 6 principles satisfied (Security, Type Safety, UX, API Contracts, TDD, Performance)
- Post-design: Re-validated after Phase 1, all principles maintained
- No violations requiring justification
- Special attention areas documented (prompt injection, streaming errors, vector performance, LLM non-determinism)

**Project Structure**:
- Documentation: plan.md, research.md, data-model.md, contracts/, quickstart.md
- Source code structure defined for backend (services, controllers, middleware, utils) and frontend (components/chat, hooks, lib/services)
- Test structure defined (unit, integration, E2E)

**Agent Context Updated**:
- CLAUDE.md updated with new technologies (TypeScript 5.x, Node.js 18+, Next.js 15, PostgreSQL with pgvector)
- Technology stack preserved for future agent sessions

## Outcome

- ✅ Impact: Complete implementation plan created for AI Chatbot RAG feature with Phase 0 research and Phase 1 design artifacts
- 🧪 Tests: Constitution validation passed (pre-design and post-design), all 6 principles satisfied
- 📁 Files: Created plan.md, research.md, data-model.md, 3 API contracts (OpenAPI 3.0), quickstart.md, updated CLAUDE.md
- 🔁 Next prompts: Ready for `/sp.tasks` to generate testable implementation tasks
- 🧠 Reflection: Plan is comprehensive, technology-validated, constitution-compliant, and developer-ready. All unknowns resolved through research. API contracts are complete and consistent. Data model supports all functional requirements. Quickstart guide enables rapid onboarding. Ready for task breakdown and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - planning completed successfully with all deliverables
- Graders run and results (PASS/FAIL): PASS - Constitution Check (pre-design and post-design), Technology validation (free tier constraints), API contract consistency
- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided phase breakdown and technology choices
- Next experiment (smallest change to try): Proceed to task breakdown phase with /sp.tasks command to generate testable implementation tasks following TDD workflow
