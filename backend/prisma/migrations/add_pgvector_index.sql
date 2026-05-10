-- Add pgvector index for faster similarity search
-- This will speed up chatbot responses by 2-3 seconds

-- Create ivfflat index on embedding column
CREATE INDEX IF NOT EXISTS documents_embedding_idx
ON "Document"
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Analyze table for better query planning
ANALYZE "Document";

-- Verify index was created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'Document'
AND indexname = 'documents_embedding_idx';
