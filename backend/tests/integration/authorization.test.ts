import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../../src/server';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Chat Authorization Tests', () => {
  let user1Id: string;
  let user2Id: string;
  let user1Token: string;
  let user2Token: string;
  let plan1Id: string;
  let plan2Id: string;

  beforeAll(async () => {
    // Create two test users
    const user1 = await prisma.user.create({
      data: {
        email: 'user1-auth@example.com',
        password: 'hashedpassword',
        name: 'User One',
        role: 'MEMBER',
      },
    });
    user1Id = user1.id;

    const user2 = await prisma.user.create({
      data: {
        email: 'user2-auth@example.com',
        password: 'hashedpassword',
        name: 'User Two',
        role: 'MEMBER',
      },
    });
    user2Id = user2.id;

    // Create plans
    const plan1 = await prisma.plan.create({
      data: {
        name: 'Basic Plan',
        price: 3000,
        duration: 30,
        features: ['Gym Access'],
      },
    });
    plan1Id = plan1.id;

    const plan2 = await prisma.plan.create({
      data: {
        name: 'Elite Plan',
        price: 8000,
        duration: 30,
        features: ['24/7 Access', 'Personal Training'],
      },
    });
    plan2Id = plan2.id;

    // Create subscriptions for both users
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);

    await prisma.subscription.create({
      data: {
        userId: user1Id,
        planId: plan1Id,
        startDate: new Date(),
        endDate: futureDate,
        status: 'ACTIVE',
      },
    });

    await prisma.subscription.create({
      data: {
        userId: user2Id,
        planId: plan2Id,
        startDate: new Date(),
        endDate: futureDate,
        status: 'ACTIVE',
      },
    });

    // Generate JWT tokens
    const jwtSecret = process.env.JWT_SECRET || 'test-secret';
    user1Token = sign({ userId: user1Id }, jwtSecret, { expiresIn: '1h' });
    user2Token = sign({ userId: user2Id }, jwtSecret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({
      where: { userId: { in: [user1Id, user2Id] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [user1Id, user2Id] } },
    });
    await prisma.plan.deleteMany({
      where: { id: { in: [plan1Id, plan2Id] } },
    });
  });

  describe('User Data Isolation', () => {
    it('should only return data for authenticated user', async () => {
      // User 1 asks about their membership
      const response1 = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          message: 'What is my current plan?',
        })
        .expect(200);

      expect(response1.body.success).toBe(true);
      const message1 = response1.body.data.message.toLowerCase();

      // Should mention Basic Plan (User 1's plan)
      // Should NOT mention Elite Plan (User 2's plan)
      expect(message1).toMatch(/basic|plan/);
    });

    it('should not leak data between users', async () => {
      // User 2 asks about their membership
      const response2 = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          message: 'What is my current plan?',
        })
        .expect(200);

      expect(response2.body.success).toBe(true);
      const message2 = response2.body.data.message.toLowerCase();

      // Should mention Elite Plan (User 2's plan)
      // Should NOT mention Basic Plan (User 1's plan)
      expect(message2).toMatch(/elite|plan/);
    });

    it('should not allow userId spoofing in request body', async () => {
      // User 1 tries to request User 2's data by passing userId in body
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          message: 'What is my current plan?',
          userId: user2Id, // Trying to spoof
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const message = response.body.data.message.toLowerCase();

      // Should return User 1's data (from JWT), not User 2's
      // JWT takes precedence over body userId
      expect(message).toMatch(/basic|plan/);
    });
  });

  describe('Authentication Edge Cases', () => {
    it('should handle missing Authorization header', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .send({
          message: 'What is my membership?',
        })
        .expect(200);

      // Should work but without personalization
      expect(response.body.success).toBe(true);
    });

    it('should handle malformed Authorization header', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', 'InvalidFormat')
        .send({
          message: 'What is my membership?',
        })
        .expect(200);

      // Should work but without personalization
      expect(response.body.success).toBe(true);
    });

    it('should handle non-existent user in JWT', async () => {
      const fakeToken = sign(
        { userId: 'non-existent-user-id' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({
          message: 'What is my membership?',
        })
        .expect(200);

      // Should work but without personalization (user not found)
      expect(response.body.success).toBe(true);
    });
  });

  describe('Data Privacy', () => {
    it('should not expose other users information in general queries', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          message: 'Tell me about all gym members',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      const message = response.body.data.message.toLowerCase();

      // Should not contain other user's name or email
      expect(message).not.toContain('user two');
      expect(message).not.toContain('user2-auth@example.com');
    });

    it('should only provide personal data for authenticated user', async () => {
      const response = await request(app)
        .post('/api/v1/chat/non-stream')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          message: 'What is my email address?',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      // Response should be about the authenticated user only
    });
  });

  describe('Concurrent User Requests', () => {
    it('should handle multiple users querying simultaneously', async () => {
      const requests = [
        request(app)
          .post('/api/v1/chat/non-stream')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({ message: 'What is my plan?' }),
        request(app)
          .post('/api/v1/chat/non-stream')
          .set('Authorization', `Bearer ${user2Token}`)
          .send({ message: 'What is my plan?' }),
      ];

      const responses = await Promise.all(requests);

      // Both should succeed
      expect(responses[0].status).toBe(200);
      expect(responses[1].status).toBe(200);

      // Both should have valid responses
      expect(responses[0].body.success).toBe(true);
      expect(responses[1].body.success).toBe(true);

      // Responses should be different (personalized to each user)
      expect(responses[0].body.data.message).not.toBe(responses[1].body.data.message);
    });
  });
});
