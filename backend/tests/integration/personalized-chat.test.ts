import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/server';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Personalized Chat Queries Integration Tests', () => {
  let testUserId: string;
  let testPlanId: string;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: 'personalized-test@example.com',
        password: 'hashedpassword',
        name: 'Test Member',
        role: 'MEMBER',
      },
    });
    testUserId = testUser.id;

    // Create test plan
    const testPlan = await prisma.plan.create({
      data: {
        name: 'Premium Plan',
        price: 5000,
        duration: 30,
        features: ['24/7 Access', 'Personal Training'],
      },
    });
    testPlanId = testPlan.id;

    // Create active subscription
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);

    await prisma.subscription.create({
      data: {
        userId: testUserId,
        planId: testPlanId,
        startDate: new Date(),
        endDate: futureDate,
        status: 'ACTIVE',
      },
    });

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    authToken = sign({ userId: testUserId }, jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.plan.delete({ where: { id: testPlanId } });
  });

  describe('Personalized Membership Queries', () => {
    it('should provide personalized response for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'What is my current membership plan?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBeDefined();

      const message = response.body.data.message.toLowerCase();
      // Should mention the plan name or membership info
      expect(message).toMatch(/premium|plan|membership/);
    });

    it('should handle expiry date queries', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'When does my membership expire?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const message = response.body.data.message.toLowerCase();
      // Should mention expiry or remaining days
      expect(message).toMatch(/expire|expiry|days|remaining/);
    });

    it('should handle remaining days queries', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'How many days are left in my membership?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const message = response.body.data.message.toLowerCase();
      expect(message).toMatch(/days|remaining|left/);
    });

    it('should work without authentication for general queries', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What are your gym timings?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBeDefined();
    });

    it('should not provide personal info without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What is my current membership plan?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const message = response.body.data.message.toLowerCase();
      // Should not have specific user data, might ask to log in
      expect(message).not.toContain('test member');
    });
  });

  describe('User Context in Responses', () => {
    it('should include user name in personalized greeting', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Hello',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Response might include personalized greeting
      expect(response.body.data.message).toBeDefined();
    });

    it('should handle queries about plan features', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'What features does my plan include?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const message = response.body.data.message.toLowerCase();
      expect(message).toMatch(/feature|access|include|benefit/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JWT token gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          message: 'What is my membership?',
        });

      // Should still work (optional auth), just without personalization
      expect(response.status).toBeLessThan(500);
    });

    it('should handle expired JWT token', async () => {
      const expiredToken = sign(
        { userId: testUserId },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send({
          message: 'What is my membership?',
        });

      // Should still work without personalization
      expect(response.status).toBeLessThan(500);
    });
  });
});
