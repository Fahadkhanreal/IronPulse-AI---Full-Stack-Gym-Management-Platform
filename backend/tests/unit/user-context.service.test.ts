import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import {
  getUserMembership,
  calculateRemainingDays,
  determineSubscriptionStatus,
  buildUserContext,
  hasActiveMembership,
  getMembershipExpiryMessage,
} from '../../src/services/user-context.service';

const prisma = new PrismaClient();

describe('User Context Service', () => {
  let testUserId: string;
  let testPlanId: string;

  beforeAll(async () => {
    // Create test user and plan
    const testUser = await prisma.user.create({
      data: {
        email: 'test-context@example.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: 'MEMBER',
      },
    });
    testUserId = testUser.id;

    const testPlan = await prisma.plan.create({
      data: {
        name: 'Test Plan',
        price: 5000,
        duration: 30,
        features: ['Feature 1', 'Feature 2'],
      },
    });
    testPlanId = testPlan.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.plan.delete({ where: { id: testPlanId } });
  });

  describe('calculateRemainingDays', () => {
    it('should calculate remaining days correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const remaining = calculateRemainingDays(futureDate);

      expect(remaining).toBeGreaterThanOrEqual(9);
      expect(remaining).toBeLessThanOrEqual(10);
    });

    it('should return 0 for expired dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const remaining = calculateRemainingDays(pastDate);

      expect(remaining).toBe(0);
    });

    it('should handle today as expiry date', () => {
      const today = new Date();

      const remaining = calculateRemainingDays(today);

      expect(remaining).toBeGreaterThanOrEqual(0);
      expect(remaining).toBeLessThanOrEqual(1);
    });
  });

  describe('determineSubscriptionStatus', () => {
    it('should return expired for 0 or negative days', () => {
      expect(determineSubscriptionStatus(0, 'ACTIVE')).toBe('expired');
      expect(determineSubscriptionStatus(-5, 'ACTIVE')).toBe('expired');
    });

    it('should return expiring_soon for 7 or fewer days', () => {
      expect(determineSubscriptionStatus(7, 'ACTIVE')).toBe('expiring_soon');
      expect(determineSubscriptionStatus(3, 'ACTIVE')).toBe('expiring_soon');
      expect(determineSubscriptionStatus(1, 'ACTIVE')).toBe('expiring_soon');
    });

    it('should return active for more than 7 days', () => {
      expect(determineSubscriptionStatus(8, 'ACTIVE')).toBe('active');
      expect(determineSubscriptionStatus(30, 'ACTIVE')).toBe('active');
      expect(determineSubscriptionStatus(100, 'ACTIVE')).toBe('active');
    });
  });

  describe('getUserMembership', () => {
    it('should return null for non-existent user', async () => {
      const membership = await getUserMembership('non-existent-id');

      expect(membership).toBeNull();
    });

    it('should return user with no plan if no subscription', async () => {
      const membership = await getUserMembership(testUserId);

      expect(membership).toBeDefined();
      expect(membership?.name).toBe('Test User');
      expect(membership?.currentPlan).toBeNull();
    });

    it('should return user with active subscription', async () => {
      // Create active subscription
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await prisma.subscription.create({
        data: {
          userId: testUserId,
          planId: testPlanId,
          startDate: new Date(),
          endDate: futureDate,
          status: 'ACTIVE',
        },
      });

      const membership = await getUserMembership(testUserId);

      expect(membership).toBeDefined();
      expect(membership?.name).toBe('Test User');
      expect(membership?.currentPlan).toBeDefined();
      expect(membership?.currentPlan?.name).toBe('Test Plan');
      expect(membership?.currentPlan?.status).toBe('active');
      expect(membership?.currentPlan?.remainingDays).toBeGreaterThan(20);

      // Cleanup
      await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    });

    it('should return expiring_soon status for subscription ending in 5 days', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 5);

      await prisma.subscription.create({
        data: {
          userId: testUserId,
          planId: testPlanId,
          startDate: new Date(),
          endDate: expiryDate,
          status: 'ACTIVE',
        },
      });

      const membership = await getUserMembership(testUserId);

      expect(membership?.currentPlan?.status).toBe('expiring_soon');
      expect(membership?.currentPlan?.remainingDays).toBeLessThanOrEqual(7);

      // Cleanup
      await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    });
  });

  describe('buildUserContext', () => {
    it('should return undefined for non-existent user', async () => {
      const context = await buildUserContext('non-existent-id');

      expect(context).toBeUndefined();
    });

    it('should build context for user with subscription', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await prisma.subscription.create({
        data: {
          userId: testUserId,
          planId: testPlanId,
          startDate: new Date(),
          endDate: futureDate,
          status: 'ACTIVE',
        },
      });

      const context = await buildUserContext(testUserId);

      expect(context).toBeDefined();
      expect(context?.name).toBe('Test User');
      expect(context?.currentPlan).toBeDefined();

      // Cleanup
      await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    });
  });

  describe('hasActiveMembership', () => {
    it('should return false for user without subscription', async () => {
      const hasActive = await hasActiveMembership(testUserId);

      expect(hasActive).toBe(false);
    });

    it('should return true for user with active subscription', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      await prisma.subscription.create({
        data: {
          userId: testUserId,
          planId: testPlanId,
          startDate: new Date(),
          endDate: futureDate,
          status: 'ACTIVE',
        },
      });

      const hasActive = await hasActiveMembership(testUserId);

      expect(hasActive).toBe(true);

      // Cleanup
      await prisma.subscription.deleteMany({ where: { userId: testUserId } });
    });
  });

  describe('getMembershipExpiryMessage', () => {
    it('should return message for user without plan', () => {
      const message = getMembershipExpiryMessage({
        name: 'John',
        currentPlan: null,
      });

      expect(message).toContain('John');
      expect(message).toContain('membership plans');
    });

    it('should return active message for active subscription', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const message = getMembershipExpiryMessage({
        name: 'John',
        currentPlan: {
          name: 'Premium',
          expiryDate: futureDate.toISOString(),
          remainingDays: 30,
          status: 'active',
        },
      });

      expect(message).toContain('Premium');
      expect(message).toContain('active');
      expect(message).toContain('30 days');
    });

    it('should return expiring soon message', () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 5);

      const message = getMembershipExpiryMessage({
        name: 'John',
        currentPlan: {
          name: 'Premium',
          expiryDate: expiryDate.toISOString(),
          remainingDays: 5,
          status: 'expiring_soon',
        },
      });

      expect(message).toContain('expiring soon');
      expect(message).toContain('5 days');
      expect(message).toContain('renew');
    });

    it('should return expired message', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const message = getMembershipExpiryMessage({
        name: 'John',
        currentPlan: {
          name: 'Premium',
          expiryDate: pastDate.toISOString(),
          remainingDays: 0,
          status: 'expired',
        },
      });

      expect(message).toContain('expired');
      expect(message).toContain('renew');
    });
  });
});
