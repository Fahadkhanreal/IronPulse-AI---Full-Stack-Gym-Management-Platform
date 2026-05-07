import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { vectorSearch, storeDocument, deleteDocumentsBySource } from '../../src/services/vector.service';
import { generateEmbedding } from '../../src/services/embedding.service';
import { DocumentMetadata } from '../../src/types/chat.types';

describe('Vector Service', () => {
  const testSource = 'test:vector-service';

  beforeAll(async () => {
    // Clean up any existing test documents
    await deleteDocumentsBySource(testSource);
  });

  afterAll(async () => {
    // Clean up test documents after tests
    await deleteDocumentsBySource(testSource);
  });

  describe('storeDocument', () => {
    it('should store document with embedding', async () => {
      const content = 'IronPulse Gym is open from 6 AM to 10 PM daily.';
      const metadata: DocumentMetadata = {
        category: 'timing',
        source: testSource,
        language: 'en',
        title: 'Test Gym Timings',
        lastUpdated: new Date().toISOString(),
      };
      const embedding = await generateEmbedding(content, { inputType: 'search_document' });

      const id = await storeDocument(content, metadata, embedding);

      expect(id).toBeDefined();
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should store multiple documents with different categories', async () => {
      const documents = [
        {
          content: 'Basic Plan costs 3000 PKR per month.',
          metadata: {
            category: 'plan' as const,
            source: testSource,
            language: 'en' as const,
            title: 'Basic Plan',
            lastUpdated: new Date().toISOString(),
          },
        },
        {
          content: 'Ahmed Khan is our lead strength coach.',
          metadata: {
            category: 'trainer' as const,
            source: testSource,
            language: 'en' as const,
            title: 'Trainer Ahmed',
            lastUpdated: new Date().toISOString(),
          },
        },
      ];

      const ids: number[] = [];
      for (const doc of documents) {
        const embedding = await generateEmbedding(doc.content, { inputType: 'search_document' });
        const id = await storeDocument(doc.content, doc.metadata, embedding);
        ids.push(id);
      }

      expect(ids.length).toBe(2);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  describe('vectorSearch', () => {
    beforeAll(async () => {
      // Insert test documents for search
      const testDocs = [
        {
          content: 'IronPulse Gym is open from 6:00 AM to 10:00 PM daily, seven days a week.',
          metadata: {
            category: 'timing' as const,
            source: testSource,
            language: 'en' as const,
            title: 'Operating Hours',
            lastUpdated: new Date().toISOString(),
          },
        },
        {
          content: 'Our Basic Plan costs 3000 PKR per month and includes access to all gym equipment.',
          metadata: {
            category: 'plan' as const,
            source: testSource,
            language: 'en' as const,
            title: 'Basic Plan',
            lastUpdated: new Date().toISOString(),
          },
        },
        {
          content: 'Ahmed Khan is our lead strength and conditioning coach with 8 years of experience.',
          metadata: {
            category: 'trainer' as const,
            source: testSource,
            language: 'en' as const,
            title: 'Trainer Ahmed',
            lastUpdated: new Date().toISOString(),
          },
        },
      ];

      for (const doc of testDocs) {
        const embedding = await generateEmbedding(doc.content, { inputType: 'search_document' });
        await storeDocument(doc.content, doc.metadata, embedding);
      }
    });

    it('should find relevant documents for query', async () => {
      const query = 'What are your gym timings?';
      const queryEmbedding = await generateEmbedding(query, { inputType: 'search_query' });

      const results = await vectorSearch(queryEmbedding, {
        limit: 3,
        threshold: 0.3,
      });

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].metadata.category).toBe('timing');
      expect(results[0].similarity).toBeGreaterThan(0.3);
    });

    it('should filter by category', async () => {
      const query = 'Tell me about plans';
      const queryEmbedding = await generateEmbedding(query, { inputType: 'search_query' });

      const results = await vectorSearch(queryEmbedding, {
        limit: 5,
        category: 'plan',
        threshold: 0.3,
      });

      expect(results).toBeDefined();
      expect(results.every(r => r.metadata.category === 'plan')).toBe(true);
    });

    it('should respect similarity threshold', async () => {
      const query = 'What are your gym timings?';
      const queryEmbedding = await generateEmbedding(query, { inputType: 'search_query' });

      const results = await vectorSearch(queryEmbedding, {
        limit: 10,
        threshold: 0.5, // Higher threshold
      });

      expect(results).toBeDefined();
      expect(results.every(r => r.similarity > 0.5)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const query = 'Tell me about the gym';
      const queryEmbedding = await generateEmbedding(query, { inputType: 'search_query' });

      const results = await vectorSearch(queryEmbedding, {
        limit: 2,
        threshold: 0.3,
      });

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return results sorted by similarity', async () => {
      const query = 'What are your gym timings?';
      const queryEmbedding = await generateEmbedding(query, { inputType: 'search_query' });

      const results = await vectorSearch(queryEmbedding, {
        limit: 3,
        threshold: 0.3,
      });

      // Check that results are sorted in descending order of similarity
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].similarity).toBeGreaterThanOrEqual(results[i + 1].similarity);
      }
    });
  });

  describe('deleteDocumentsBySource', () => {
    it('should delete documents by source', async () => {
      const tempSource = 'test:temp-source';

      // Insert a test document
      const content = 'Temporary test document';
      const metadata: DocumentMetadata = {
        category: 'timing',
        source: tempSource,
        language: 'en',
        title: 'Temp Doc',
        lastUpdated: new Date().toISOString(),
      };
      const embedding = await generateEmbedding(content);
      await storeDocument(content, metadata, embedding);

      // Delete by source
      const deletedCount = await deleteDocumentsBySource(tempSource);

      expect(deletedCount).toBeGreaterThan(0);

      // Verify deletion
      const queryEmbedding = await generateEmbedding('test');
      const results = await vectorSearch(queryEmbedding, { limit: 10 });
      const remainingDocs = results.filter(r => r.metadata.source === tempSource);

      expect(remainingDocs.length).toBe(0);
    });
  });
});
