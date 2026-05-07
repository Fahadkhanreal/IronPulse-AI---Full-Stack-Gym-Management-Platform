import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

const COHERE_MODEL = process.env.COHERE_MODEL || 'embed-english-v4.0';
const BATCH_SIZE = 96; // Cohere supports up to 96 texts per batch

export interface EmbeddingOptions {
  inputType?: 'search_document' | 'search_query';
  truncate?: 'NONE' | 'START' | 'END';
}

/**
 * Generate embeddings for a single text using Cohere
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {}
): Promise<number[]> {
  const { inputType = 'search_document', truncate = 'END' } = options;

  try {
    const response = await cohere.embed({
      texts: [text],
      model: COHERE_MODEL,
      inputType,
      truncate,
    });

    const embeddings = response.embeddings as number[][];

    if (!embeddings || embeddings.length === 0) {
      throw new Error('No embeddings returned from Cohere API');
    }

    return embeddings[0];
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batches using Cohere
 */
export async function generateEmbeddings(
  texts: string[],
  options: EmbeddingOptions = {}
): Promise<number[][]> {
  const { inputType = 'search_document', truncate = 'END' } = options;

  if (texts.length === 0) {
    return [];
  }

  try {
    const embeddings: number[][] = [];

    // Process in batches of 96 for efficiency
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);

      console.log(`Generating embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} texts)`);

      const response = await cohere.embed({
        texts: batch,
        model: COHERE_MODEL,
        inputType,
        truncate,
      });

      const batchEmbeddings = response.embeddings as number[][];

      if (!batchEmbeddings || batchEmbeddings.length === 0) {
        throw new Error(`No embeddings returned for batch starting at index ${i}`);
      }

      embeddings.push(...batchEmbeddings);
    }

    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Chunk text into smaller pieces for embedding
 * Optimal chunk size: 256-512 tokens (~1000-2000 characters)
 */
export function chunkText(text: string, chunkSize: number = 1600, overlap: number = 200): string[] {
  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);
    chunks.push(chunk);

    // Move start position with overlap
    start = end - overlap;

    // Prevent infinite loop if overlap is too large
    if (start <= chunks.length * overlap) {
      start = end;
    }
  }

  return chunks;
}

/**
 * Estimate token count (rough approximation: 1 token ≈ 4 characters)
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if API key is configured
 */
export function isCohereConfigured(): boolean {
  return !!process.env.COHERE_API_KEY && process.env.COHERE_API_KEY.length > 0;
}
