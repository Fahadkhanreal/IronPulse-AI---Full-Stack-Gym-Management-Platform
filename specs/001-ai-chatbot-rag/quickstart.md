# Quickstart Guide: AI-Powered Gym Support Chatbot

**Feature**: 001-ai-chatbot-rag  
**Last Updated**: 2026-05-06  
**Prerequisites**: Node.js 18+, PostgreSQL with pgvector, Cohere API key, Groq API key

## Overview

This guide helps developers set up and run the RAG-powered chatbot feature locally. Follow these steps to get the chatbot working in your development environment.

---

## 1. Environment Setup

### Install Dependencies

**Backend**:
```bash
cd backend
npm install @cohere-ai/cohere-ai groq-sdk langchain @langchain/community ai
```

**Frontend**:
```bash
cd frontend
npm install ai framer-motion react-markdown
```

### Environment Variables

Add these to `backend/.env`:

```env
# Existing variables
DATABASE_URL="postgresql://user:password@localhost:5432/ironpulse"
JWT_SECRET="your-jwt-secret"

# New variables for chatbot
COHERE_API_KEY="your-cohere-api-key"
GROQ_API_KEY="your-groq-api-key"

# Optional: For production
COHERE_MODEL="embed-english-v4.0"  # or "embed-multilingual-v4.0" for Urdu
GROQ_MODEL="llama-3.1-70b-versatile"
```

**Get API Keys**:
- **Cohere**: Sign up at https://cohere.com → Dashboard → API Keys
- **Groq**: Sign up at https://console.groq.com → API Keys

---

## 2. Database Setup

### Enable pgvector Extension

```bash
# Connect to your database
psql $DATABASE_URL

# Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

# Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

### Run Migrations

```bash
cd backend
npx prisma migrate dev --name add_chatbot_tables
```

This creates:
- `Document` table with vector column
- `ChatHistory` table for conversation storage
- Indexes for vector similarity search

### Verify Schema

```bash
npx prisma studio
```

Check that `Document` and `ChatHistory` tables exist.

---

## 3. Knowledge Base Ingestion

### Prepare Knowledge Base Content

Create `backend/scripts/seed-knowledge.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { ingestDocuments } from '../src/services/rag.service';

const prisma = new PrismaClient();

async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base...');

  // Gym timings
  await ingestDocuments([
    {
      content: 'IronPulse Gym is open from 6 AM to 10 PM daily, including weekends and holidays. Premium members have 24/7 access with their key cards.',
      metadata: {
        category: 'timing',
        source: 'admin:seed',
        language: 'en',
        title: 'Gym Operating Hours',
        lastUpdated: new Date().toISOString(),
      },
    },
  ]);

  // Membership plans
  const plans = await prisma.plan.findMany();
  for (const plan of plans) {
    await ingestDocuments([
      {
        content: `Membership Plan: ${plan.name}
Price: ${plan.price} PKR per ${plan.duration}
Features: ${plan.features.join(', ')}
Benefits: ${plan.benefits}
Description: ${plan.description}`,
        metadata: {
          category: 'plan',
          source: 'database:plans',
          entityId: plan.id,
          language: 'en',
          title: plan.name,
          lastUpdated: new Date().toISOString(),
        },
      },
    ]);
  }

  // Trainers
  const trainers = await prisma.trainer.findMany();
  for (const trainer of trainers) {
    await ingestDocuments([
      {
        content: `Trainer: ${trainer.name}
Specialization: ${trainer.specialization}
Experience: ${trainer.experience} years
Bio: ${trainer.bio || 'Certified fitness professional'}`,
        metadata: {
          category: 'trainer',
          source: 'database:trainers',
          entityId: trainer.id,
          language: 'en',
          title: trainer.name,
          lastUpdated: new Date().toISOString(),
        },
      },
    ]);
  }

  console.log('✅ Knowledge base seeded successfully');
}

seedKnowledgeBase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Run Seeding Script

```bash
cd backend
npx ts-node scripts/seed-knowledge.ts
```

**Expected Output**:
```
🌱 Seeding knowledge base...
Generating embeddings for 1 documents...
Storing documents in database...
Generating embeddings for 3 documents...
Storing documents in database...
Generating embeddings for 5 documents...
Storing documents in database...
✅ Knowledge base seeded successfully
```

### Verify Ingestion

```bash
# Check document count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Document\";"

# Check vector dimensions
psql $DATABASE_URL -c "SELECT id, metadata->>'category', metadata->>'title' FROM \"Document\" LIMIT 5;"
```

---

## 4. Backend API Setup

### Start Backend Server

```bash
cd backend
npm run dev
```

Server should start on `http://localhost:5000`.

### Test Chat Endpoint

```bash
# Test without authentication (general query)
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are your gym timings?"}'
```

**Expected Response** (streaming):
```
data: {"type":"start","conversationId":"clh..."}

data: {"type":"token","content":"Our"}

data: {"type":"token","content":" gym"}

data: {"type":"token","content":" is"}

data: {"type":"token","content":" open"}

...

data: {"type":"done","metadata":{"tokensUsed":45,"responseTime":856}}
```

### Test with Authentication

```bash
# Login to get JWT token
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# Test personalized query
curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message": "When does my membership expire?"}'
```

---

## 5. Frontend Integration

### Add Chat Widget Component

The chat widget is already implemented in `frontend/components/chat/ChatWidget.tsx`.

### Add to Layout

Edit `frontend/app/layout.tsx`:

```typescript
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
```

### Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend should start on `http://localhost:3000`.

### Test Chat Widget

1. Open `http://localhost:3000` in browser
2. Click floating chat button (bottom-right corner)
3. Type a message: "What are your gym timings?"
4. Verify streaming response appears

---

## 6. Testing

### Unit Tests

```bash
# Backend
cd backend
npm test src/services/embedding.service.test.ts
npm test src/services/vector.service.test.ts
npm test src/services/rag.service.test.ts

# Frontend
cd frontend
npm test components/chat/ChatWidget.test.tsx
```

### Integration Tests

```bash
cd backend
npm test tests/integration/chat-api.test.ts
```

### E2E Tests

```bash
cd frontend
npx playwright test tests/e2e/chat-flow.spec.ts
```

---

## 7. Common Issues & Troubleshooting

### Issue: "pgvector extension not found"

**Solution**:
```bash
# Install pgvector (Ubuntu/Debian)
sudo apt install postgresql-15-pgvector

# Install pgvector (macOS)
brew install pgvector

# Then enable in database
psql $DATABASE_URL -c "CREATE EXTENSION vector;"
```

### Issue: "Cohere API rate limit exceeded"

**Solution**:
- Free tier: 1000 calls/month
- Reduce ingestion frequency
- Cache embeddings for repeated queries
- Consider upgrading to paid tier

### Issue: "Groq API rate limit exceeded"

**Solution**:
- Free tier: 30 requests/minute
- Implement exponential backoff (already in code)
- Add request queuing for high traffic
- Consider fallback to Gemini 1.5 Flash

### Issue: "Vector search returns no results"

**Solution**:
```bash
# Check if documents have embeddings
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"Document\" WHERE embedding IS NOT NULL;"

# Check vector index
psql $DATABASE_URL -c "SELECT indexname FROM pg_indexes WHERE tablename = 'Document';"

# Rebuild index if needed
psql $DATABASE_URL -c "REINDEX INDEX \"Document_embedding_idx\";"
```

### Issue: "Chat widget not appearing"

**Solution**:
- Check browser console for errors
- Verify `ChatWidget` is imported in layout
- Check z-index conflicts with other components
- Clear browser cache and reload

### Issue: "Streaming response not working"

**Solution**:
- Verify backend returns `Content-Type: text/event-stream`
- Check CORS headers allow streaming
- Test with curl first to isolate frontend issues
- Check browser network tab for SSE connection

---

## 8. Development Workflow

### Adding New Knowledge

**Option 1: Admin Dashboard** (recommended for production)
```typescript
// POST /api/v1/ingest
{
  "documents": [
    {
      "content": "New gym policy: ...",
      "metadata": {
        "category": "policy",
        "source": "admin:upload",
        "language": "en"
      }
    }
  ]
}
```

**Option 2: Script** (for bulk updates)
```bash
npx ts-node scripts/ingest-custom.ts
```

### Updating Existing Knowledge

When database entities (Plan, Trainer) are updated, the knowledge base auto-updates via Prisma middleware. No manual action needed.

### Testing New Queries

```bash
# Quick test script
echo '{"message": "Your test query here"}' | \
  curl -X POST http://localhost:5000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d @-
```

### Monitoring Performance

```bash
# Check vector search performance
psql $DATABASE_URL -c "EXPLAIN ANALYZE 
  SELECT id, content, 1 - (embedding <=> '[0.1, 0.2, ...]'::vector) as similarity 
  FROM \"Document\" 
  ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector 
  LIMIT 5;"
```

---

## 9. Next Steps

After completing this quickstart:

1. **Review Specification**: Read `specs/001-ai-chatbot-rag/spec.md` for full requirements
2. **Review Data Model**: Read `specs/001-ai-chatbot-rag/data-model.md` for entity details
3. **Review API Contracts**: Check `specs/001-ai-chatbot-rag/contracts/` for endpoint specs
4. **Run Tasks**: Execute `/sp.tasks` to generate implementation tasks
5. **Start Implementation**: Follow TDD workflow (Red → Green → Refactor)

---

## 10. Useful Commands

```bash
# Reset knowledge base
psql $DATABASE_URL -c "TRUNCATE \"Document\" RESTART IDENTITY CASCADE;"

# Check embedding dimensions
psql $DATABASE_URL -c "SELECT vector_dims(embedding) FROM \"Document\" LIMIT 1;"

# View recent conversations
psql $DATABASE_URL -c "SELECT id, \"userId\", \"createdAt\" FROM \"ChatHistory\" ORDER BY \"createdAt\" DESC LIMIT 5;"

# Monitor API logs
cd backend && npm run dev | grep "chat"

# Test rate limiting
for i in {1..15}; do curl -X POST http://localhost:5000/api/v1/chat -H "Content-Type: application/json" -d '{"message":"test"}'; done
```

---

## Support

- **Documentation**: `specs/001-ai-chatbot-rag/`
- **Issues**: Create GitHub issue with `chatbot` label
- **Questions**: Ask in team chat or create discussion

**Happy coding! 🚀**
