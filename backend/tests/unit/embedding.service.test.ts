import { describe, it, expect, beforeAll } from '@jest/globals';
import { generateEmbedding, generateBatchEmbeddings } from '../../src/services/embedding.service';

describe('Embedding Service', () => {
  beforeAll(() => {
    // Ensure API key is configured
    if (!process.env.COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY not configured');
    }
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for single text', async () => {
      const text = 'What are your gym timings?';
      const embedding = await generateEmbedding(text, { inputType: 'search_query' });

      expect(embedding).toBeDefined();
      expect(Array.isArray(embedding)).toBe(true);
      expect(embedding.length).toBe(1024); // Cohere embed-english-v3.0 dimension
      expect(typeof embedding[0]).toBe('number');
    });

    it('should handle empty text gracefully', async () => {
      const text = '';
      await expect(generateEmbedding(text)).rejects.toThrow();
    });

    it('should generate different embeddings for different texts', async () => {
      const text1 = 'What are your gym timings?';
      const text2 = 'Tell me about membership plans';

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);

      expect(embedding1).not.toEqual(embedding2);
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('should generate embeddings for multiple texts', async () => {
      const texts = [
        'What are your gym timings?',
        'Tell me about membership plans',
        'Who are your trainers?',
      ];

      const embeddings = await generateBatchEmbeddings(texts, { inputType: 'search_document' });

      expect(embeddings).toBeDefined();
      expect(Array.isArray(embeddings)).toBe(true);
      expect(embeddings.length).toBe(3);
      expect(embeddings[0].length).toBe(1024);
      expect(embeddings[1].length).toBe(1024);
      expect(embeddings[2].length).toBe(1024);
    });

    it('should handle batch size limits', async () => {
      // Cohere allows up to 96 texts per batch
      const texts = Array(100).fill('Sample text for testing batch limits');

      const embeddings = await generateBatchEmbeddings(texts);

      expect(embeddings.length).toBe(100);
    });

    it('should handle empty batch', async () => {
      const texts: string[] = [];
      const embeddings = await generateBatchEmbeddings(texts);

      expect(embeddings).toBeDefined();
      expect(embeddings.length).toBe(0);
    });
  });

  describe('embedding similarity', () => {
    it('should produce similar embeddings for similar texts', async () => {
      const text1 = 'What are your gym opening hours?';
      const text2 = 'What time does the gym open?';

      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);

      // Calculate cosine similarity
      const dotProduct = embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
      const magnitude1 = Math.sqrt(embedding1.reduce((sum, val) => sum + val * val, 0));
      const magnitude2 = Math.sqrt(embedding2.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (magnitude1 * magnitude2);

      // Similar texts should have high similarity (> 0.7)
      expect(similarity).toBeGreaterThan(0.7);
    });
  });
});
