# pgvector Index Setup Instructions

## Run this SQL on your Neon Database

### Option 1: Using Neon Console (Recommended)
1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Copy and paste the SQL from `add_pgvector_index.sql`
5. Click "Run"

### Option 2: Using psql
```bash
psql "YOUR_DATABASE_URL" -f prisma/migrations/add_pgvector_index.sql
```

### Option 3: Using Prisma Studio
```bash
npm run prisma:studio
# Then run the SQL in the query tab
```

## Verification
After running, you should see:
- Index created: `documents_embedding_idx`
- Type: `ivfflat`
- Column: `embedding`

## Expected Performance Improvement
- Before: 2-3 seconds per vector search
- After: 200-500ms per vector search
- **Chatbot 2-3 seconds faster overall**
