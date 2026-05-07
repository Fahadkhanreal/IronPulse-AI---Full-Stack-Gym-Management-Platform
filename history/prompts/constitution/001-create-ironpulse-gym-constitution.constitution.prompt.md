---
id: 001
title: Create IronPulse Gym Constitution
stage: constitution
date: 2026-04-20
surface: agent
model: claude-sonnet-4-6
feature: none
branch: master
user: Fahadkhanreal
command: /sp.constitution
labels: ["constitution", "setup", "governance", "ironpulse-gym"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

full stack gym website 

# 🏋️‍♂️ IRONPULSE GYM – Full Stack Website
**Complete Project Specification (SDD+)**

**Project Name:** IronPulse Gym  
**Version:** 1.0  
**Date:** April 20, 2026  
**Author:** Fahad  
**Methodology:** Spec-Driven Development (Panaversity SDD+)

## 📌 1. Project Vision & Goals

IronPulse Gym ek modern, fast aur professional gym management website hai. Isme users easily membership plans dekh sakte hain, select kar sakte hain aur sessions book kar sakte hain. Admin ko plans aur bookings manage karne ka powerful dashboard milega.

**Core Objectives:**
- Clean, modern aur responsive UI/UX
- Secure authentication system
- Smooth booking experience
- Admin-friendly dashboard
- Production-level code quality (Portfolio + Freelancing ke liye)

**Success Criteria (MVP):**
- User 30-45 seconds mein signup → plan select → booking complete kar sake
- Fully responsive (mobile + desktop)
- Secure JWT authentication
- Clean error handling aur loading states
- Admin plans aur bookings manage kar sake

## 🎯 2. User Roles & Stories

### Guest User
- Home, Plans, Trainers aur Contact pages dekh sake
- Signup aur Login kar sake

### Registered Member
- Profile dekh aur update kar sake
- Available membership plans browse kar sake
- Desired date pe booking create kar sake
- Apni past aur upcoming bookings dekh sake

### Admin
- New plans add, edit aur delete kar sake
- Sabhi bookings ki list dekh sake
- Booking status update kar sake (future phase mein)

## 🛠️ 3. Tech Stack

**Frontend:**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- ShadCN/UI + Lucide React Icons
- Framer Motion (smooth animations)
- TanStack Query (server state)
- Zustand (client state)
- Axios (API client with interceptors)

**Backend:**
- Node.js + Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- bcryptjs (password hashing)
- Zod (schema validation)
- Helmet + CORS

**Deployment:**
- Frontend: Vercel
- Backend: Render / Railway
- Database: Neon

[Full specification content truncated for brevity - includes folder structure, database schema, API routes, frontend pages, security practices, and development phases]

## Response snapshot

Created IronPulse Gym Constitution v1.0.0 with six core principles:

1. **Security-First Development**: Mandatory bcrypt password hashing, JWT authentication, Zod validation on both frontend/backend, protected routes, environment variables for secrets, CORS configuration, and Prisma ORM for SQL injection prevention.

2. **Type Safety & Validation**: TypeScript strict mode throughout stack, Zod schemas at all boundaries (forms, API requests, database), Prisma as single source of truth, no `any` types except documented third-party interfaces.

3. **User Experience Excellence**: Loading states for all async operations, user-friendly error messages, toast notifications, responsive design tested at 375px/768px/1440px breakpoints, Framer Motion animations (max 300ms), inline form validation, accessibility with semantic HTML and ARIA labels.

4. **API Contract Integrity**: Explicit request/response schemas, consistent error format `{success: false, error: string}`, consistent success format `{success: true, data: T}`, correct HTTP status codes, `/api/v1/` versioning, no breaking changes without version bump.

5. **Test-Driven Development**: Automated tests required for authentication flows, booking logic, admin CRUD, database constraints, API endpoints, and critical frontend forms before production deployment.

6. **Performance & Scalability**: Code splitting, lazy loading, image optimization, database indexes on email/userId/planId, <200ms target for simple queries, <500ms for complex operations, connection pooling, TanStack Query caching, pagination for lists >20 items.

Also defined Technology Standards (mandatory stack, code style, git workflow), Development Workflow (feature process, code review checklist, quality gates), and Governance (amendment process, semantic versioning, compliance review, runtime guidance reference to CLAUDE.md).

## Outcome

- ✅ Impact: Created foundational governance document (constitution v1.0.0) establishing six core principles for IronPulse Gym full-stack development
- 🧪 Tests: N/A (constitution is a governance document)
- 📁 Files: Created/updated .specify/memory/constitution.md with complete principle definitions
- 🔁 Next prompts: /sp.specify to create feature specifications, /sp.plan for architecture planning
- 🧠 Reflection: Constitution successfully captures security, type safety, UX, API contracts, testing, and performance requirements specific to gym management system with Next.js 15 + Express.js + Prisma stack

## Evaluation notes (flywheel)

- Failure modes observed: None - constitution created successfully on first attempt
- Graders run and results (PASS/FAIL): Manual validation PASS - all placeholders filled, no bracket tokens remaining, version 1.0.0 appropriate for initial creation, dates in ISO format, principles are declarative and testable
- Prompt variant (if applicable): Standard /sp.constitution workflow
- Next experiment (smallest change to try): Monitor whether constitution principles are referenced during feature specification and planning phases to ensure governance compliance
