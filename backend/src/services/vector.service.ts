import { PrismaClient } from '@prisma/client';
import { DocumentMetadata } from '../types/chat.types';

const prisma = new PrismaClient();

export interface VectorSearchOptions {
  limit?: number;
  threshold?: number;
  category?: string;
  language?: 'en' | 'ur' | 'roman-ur';
}

export interface SearchResult {
  id: number;
  content: string;
  metadata: DocumentMetadata;
  similarity: number;
}

/**
 * Perform vector similarity search using pgvector
 * Uses cosine distance (1 - cosine_similarity)
 */
export async function vectorSearch(
  queryEmbedding: number[],
  options: VectorSearchOptions = {}
): Promise<SearchResult[]> {
  const {
    limit = 5,
    threshold = 0.7,
    category,
    language,
  } = options;

  try {
    // Build the SQL query with optional filters
    let whereClause = '';
    const params: any[] = [JSON.stringify(queryEmbedding), limit];

    if (category) {
      whereClause += ` AND metadata->>'category' = $${params.length + 1}`;
      params.push(category);
    }

    if (language) {
      whereClause += ` AND metadata->>'language' = $${params.length + 1}`;
      params.push(language);
    }

    // Query using cosine distance
    // 1 - (embedding <=> query) gives similarity score (0-1)
    const query = `
      SELECT
        id,
        content,
        metadata,
        1 - (embedding <=> $1::vector) as similarity
      FROM "Document"
      WHERE 1 - (embedding <=> $1::vector) > ${threshold}
      ${whereClause}
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;

    const results = await prisma.$queryRawUnsafe<Array<{
      id: number;
      content: string;
      metadata: any;
      similarity: number;
    }>>(query, ...params);

    return results.map(result => ({
      id: result.id,
      content: result.content,
      metadata: result.metadata as DocumentMetadata,
      similarity: result.similarity,
    }));
  } catch (error) {
    console.error('Error performing vector search:', error);
    throw new Error(`Vector search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store a document with its embedding in the database
 */
export async function storeDocument(
  content: string,
  metadata: DocumentMetadata,
  embedding: number[]
): Promise<number> {
  try {
    // Use raw query to insert vector data
    const result = await prisma.$queryRawUnsafe<Array<{ id: number }>>(
      `
      INSERT INTO "Document" (content, metadata, embedding, "createdAt", "updatedAt")
      VALUES ($1, $2::jsonb, $3::vector, NOW(), NOW())
      RETURNING id
      `,
      content,
      JSON.stringify(metadata),
      JSON.stringify(embedding)
    );

    return result[0].id;
  } catch (error) {
    console.error('Error storing document:', error);
    throw new Error(`Failed to store document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store multiple documents with embeddings in a transaction
 */
export async function storeDocuments(
  documents: Array<{
    content: string;
    metadata: DocumentMetadata;
    embedding: number[];
  }>
): Promise<number[]> {
  try {
    const ids: number[] = [];

    // Use transaction for batch insert
    await prisma.$transaction(async (tx) => {
      for (const doc of documents) {
        const result = await tx.$queryRawUnsafe<Array<{ id: number }>>(
          `
          INSERT INTO "Document" (content, metadata, embedding, "createdAt", "updatedAt")
          VALUES ($1, $2::jsonb, $3::vector, NOW(), NOW())
          RETURNING id
          `,
          doc.content,
          JSON.stringify(doc.metadata),
          JSON.stringify(doc.embedding)
        );
        ids.push(result[0].id);
      }
    });

    return ids;
  } catch (error) {
    console.error('Error storing documents:', error);
    throw new Error(`Failed to store documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete documents by source identifier
 */
export async function deleteDocumentsBySource(source: string): Promise<number> {
  try {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "Document" WHERE metadata->>'source' = $1`,
      source
    );

    return result;
  } catch (error) {
    console.error('Error deleting documents:', error);
    throw new Error(`Failed to delete documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete documents by category
 */
export async function deleteDocumentsByCategory(category: string): Promise<number> {
  try {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "Document" WHERE metadata->>'category' = $1`,
      category
    );

    return result;
  } catch (error) {
    console.error('Error deleting documents:', error);
    throw new Error(`Failed to delete documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get document count by category
 */
export async function getDocumentCountByCategory(): Promise<Record<string, number>> {
  try {
    const results = await prisma.$queryRawUnsafe<Array<{ category: string; count: bigint }>>(
      `SELECT metadata->>'category' as category, COUNT(*) as count
       FROM "Document"
       GROUP BY metadata->>'category'`
    );

    const counts: Record<string, number> = {};
    for (const result of results) {
      counts[result.category] = Number(result.count);
    }

    return counts;
  } catch (error) {
    console.error('Error getting document counts:', error);
    throw new Error(`Failed to get document counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create vector index for better performance
 * Should be run after initial data ingestion
 */
export async function createVectorIndex(): Promise<void> {
  try {
    // Create IVFFlat index for approximate nearest neighbor search
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Document_embedding_idx"
      ON "Document"
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);

    console.log('✅ Vector index created successfully');
  } catch (error) {
    console.error('Error creating vector index:', error);
    throw new Error(`Failed to create vector index: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get all documents with pagination
 */
export async function getAllDocuments(
  page: number = 1,
  pageSize: number = 20,
  category?: string
): Promise<{ documents: any[]; total: number; page: number; pageSize: number }> {
  try {
    const skip = (page - 1) * pageSize;
    let whereClause = '';
    if (category) {
      whereClause = `WHERE metadata->>'category' = '${category}'`;
    }

    const [documents, totalResult] = await Promise.all([
      prisma.$queryRawUnsafe<any[]>(`
        SELECT id, content, metadata, "createdAt" as created_at, "updatedAt" as updated_at
        FROM "Document"
        ${whereClause}
        ORDER BY "createdAt" DESC
        LIMIT ${pageSize} OFFSET ${skip}
      `),
      prisma.$queryRawUnsafe<[{ count: bigint }]>(`
        SELECT COUNT(*)::int as count
        FROM "Document"
        ${whereClause}
      `),
    ]);

    return {
      documents,
      total: Number(totalResult[0].count),
      page,
      pageSize,
    };
  } catch (error) {
    console.error('Error getting all documents:', error);
    throw new Error(`Failed to get documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get document by ID
 */
export async function getDocumentById(id: number): Promise<any | null> {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id, content, metadata, "createdAt" as created_at, "updatedAt" as updated_at
      FROM "Document"
      WHERE id = ${id}
    `);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting document by ID:', error);
    throw new Error(`Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new document
 */
export async function createDocument(data: {
  content: string;
  metadata: any;
  embedding: number[];
}): Promise<any> {
  try {
    const embeddingString = `[${data.embedding.join(',')}]`;
    const metadataJson = JSON.stringify(data.metadata);
    const result = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO "Document" (content, metadata, embedding, "createdAt", "updatedAt")
      VALUES ('${data.content.replace(/'/g, "''")}', '${metadataJson}'::jsonb, '${embeddingString}'::vector, NOW(), NOW())
      RETURNING id, content, metadata, "createdAt" as created_at, "updatedAt" as updated_at
    `);
    return result[0];
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a document
 */
export async function updateDocument(
  id: number,
  data: { content: string; metadata: any; embedding: number[] }
): Promise<any> {
  try {
    const embeddingString = `[${data.embedding.join(',')}]`;
    const metadataJson = JSON.stringify(data.metadata);
    const result = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE "Document"
      SET content = '${data.content.replace(/'/g, "''")}',
          metadata = '${metadataJson}'::jsonb,
          embedding = '${embeddingString}'::vector,
          "updatedAt" = NOW()
      WHERE id = ${id}
      RETURNING id, content, metadata, "createdAt" as created_at, "updatedAt" as updated_at
    `);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(id: number): Promise<boolean> {
  try {
    const result = await prisma.$executeRawUnsafe(`DELETE FROM "Document" WHERE id = ${id}`);
    return result > 0;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Search documents
 */
export async function searchDocuments(
  queryEmbedding: number[],
  options: { limit?: number; category?: string } = {}
): Promise<SearchResult[]> {
  return vectorSearch(queryEmbedding, {
    limit: options.limit || 10,
    threshold: 0.3,
    category: options.category,
  });
}
