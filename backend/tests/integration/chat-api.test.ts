import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/server';
import { storeDocument, deleteDocumentsBySource } from '../../../src/services/vector.service';
import { generateEmbedding } from '../../../src/services/embedding.service';

describe('Chat API Integration Tests', () => {
  const testSource = 'test:chat-api';

  beforeAll(async () => {
    // Clean up and insert test documents
    await deleteDocumentsBySource(testSource);

    const testDocs = [
      {
        content: 'IronPulse Gym is open from 6:00 AM to 10:00 PM daily.',
        metadata: {
          category: 'timing' as const,
          source: testSource,
          language: 'en' as const,
          title: 'Operating Hours',
          lastUpdated: new Date().toISOString(),
        },
      },
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
    ];

    for (const doc of testDocs) {
      const embedding = await generateEmbedding(doc.content, { inputType: 'search_document' });
      await storeDocument(doc.content, doc.metadata, embedding);
    }
  });

  afterAll(async () => {
    await deleteDocumentsBySource(testSource);
  });

  describe('POST /api/v1/chat/non-stream', () => {
    it('should return 200 and valid response for valid query', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.message).toBeDefined();
      expect(typeof response.body.data.message).toBe('string');
      expect(response.body.data.message.length).toBeGreaterThan(0);
      expect(response.body.data.metadata).toBeDefined();
      expect(response.body.data.metadata.tokensUsed).toBeGreaterThan(0);
      expect(response.body.data.metadata.responseTime).toBeGreaterThan(0);
      expect(response.body.data.metadata.retrievedDocs).toBeGreaterThanOrEqual(0);
    });

    it('should return 400 for invalid request format', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          // Missing required 'message' field
          userId: 'test-user',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(response.body.code).toBe('INVALID_INPUT');
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: '',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle long messages', async () => {
      const longMessage = 'What are your gym timings? '.repeat(50);

      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: longMessage,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should include userId in request when provided', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
          userId: 'test-user-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle conversationId in request', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
          conversationId: 'conv-123',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/chat (streaming)', () => {
    it('should return SSE stream for valid query', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200)
        .expect('Content-Type', /text\/event-stream/);

      expect(response.text).toBeDefined();
      expect(response.text).toContain('data:');
    });

    it('should return 400 for invalid streaming request', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({
          // Missing required 'message' field
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INVALID_INPUT');
    });

    it('should include start event in stream', async () => {
      const response = await request(app)
        .post('/api/v1/chat')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200);

      expect(response.text).toContain('"type":"start"');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make 11 requests rapidly (limit is 10 per minute)
      const requests = [];
      for (let i = 0; i < 11; i++) {
        requests.push(
          request(app)
            .post('/api/v1/chat/non-stream')
            .send({
              message: `Test message ${i}`,
            })
        );
      }

      const responses = await Promise.all(requests);

      // At least one should be rate limited
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);

      // Check rate limit response format
      const rateLimitedResponse = responses.find(r => r.status === 429);
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.body.success).toBe(false);
        expect(rateLimitedResponse.body.code).toBe('RATE_LIMIT_EXCEEDED');
        expect(rateLimitedResponse.headers['retry-after']).toBeDefined();
      }
    }, 30000); // Increase timeout for this test
  });

  describe('Authentication', () => {
    it('should work without authentication (guest mode)', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should accept valid JWT token', async () => {
      // Note: This would require a valid JWT token from your auth system
      // For now, we test that the endpoint accepts the Authorization header
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          message: 'What are your gym timings?',
        });

      // Should still work (optional auth)
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Response Quality', () => {
    it('should provide relevant answer for gym timings', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200);

      const message = response.body.data.message.toLowerCase();
      expect(message).toMatch(/6.*am|6:00/);
      expect(message).toMatch(/10.*pm|10:00/);
    });

    it('should provide relevant answer for membership plans', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What membership plans do you offer?',
        })
        .expect(200);

      const message = response.body.data.message.toLowerCase();
      expect(message).toMatch(/plan|membership/);
      expect(message).toMatch(/3000|pkr/);
    });

    it('should respond within acceptable time', async () => {
      const startTime = Date.now();

      await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 10 seconds
      expect(responseTime).toBeLessThan(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toBeDefined();
    });

    it('should handle special characters in message', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings? 🏋️‍♂️💪',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should sanitize potentially malicious input', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: '<script>alert("xss")</script> What are your gym timings?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Response should not contain the script tag
      expect(response.body.data.message).not.toContain('<script>');
    });
  });
});
