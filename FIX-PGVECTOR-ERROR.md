# Fix 500 Error - Enable pgvector Extension

## Problem
Database migration failing with error:
```
ERROR: type "vector" does not exist
```

This is because pgvector extension is not enabled in your Neon database.

## Solution - Enable pgvector in Neon Dashboard

### Option 1: Neon Dashboard (Recommended)

1. **Go to Neon Dashboard**: https://console.neon.tech
2. **Select your project**: "neondb"
3. **Go to SQL Editor** (left sidebar)
4. **Run this SQL command**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. **Click "Run"**
6. **Verify** by running:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```

### Option 2: Using Database URL

If you have PostgreSQL client installed:
```bash
# Connect to database
psql "postgresql://neondb_owner:npg_yD9CRP1noNWu@ep-small-river-amvkjhrh-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Run command
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

### Option 3: Temporary Workaround (Skip pgvector)

If you don't need the AI chatbot right now, you can temporarily disable the Document model:

1. Open `backend/prisma/schema.prisma`
2. Comment out the Document model:
   ```prisma
   // model Document {
   //   id        Int                   @id @default(autoincrement())
   //   content   String
   //   metadata  Json
   //   embedding Unsupported("vector")
   //   createdAt DateTime              @default(now())
   //   updatedAt DateTime              @updatedAt
   //
   //   @@index([createdAt])
   //   @@index([metadata], type: Gin)
   //   @@index([embedding])
   // }
   ```
3. Run migration:
   ```bash
   cd backend
   npx prisma db push --force-reset --skip-generate
   npx prisma generate
   ```
4. Restart backend:
   ```bash
   npm run dev
   ```

## After Enabling pgvector

Once pgvector is enabled, run:

```bash
cd "D:\Governor Sindh It Initiative\code\full-stack-gym-website\backend"

# Run migration
npx prisma db push --force-reset --skip-generate

# Generate Prisma client
npx prisma generate

# Restart backend
npm run dev
```

## Verify Fix

1. Open browser: http://localhost:3000
2. Check homepage (should load without errors)
3. Check admin testimonials: http://localhost:3000/admin/testimonials
4. No more 500 errors!

## Why This Happened

- AI chatbot uses pgvector for semantic search
- Document model stores embeddings as vector type
- Neon database needs pgvector extension enabled
- Extension must be enabled before running migrations

## Next Steps

1. Enable pgvector (choose option above)
2. Run migration
3. Restart backend
4. Test application
