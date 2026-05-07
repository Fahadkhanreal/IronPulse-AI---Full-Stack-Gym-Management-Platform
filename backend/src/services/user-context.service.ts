import { PrismaClient } from '@prisma/client';
import { UserContext } from '../types/chat.types';

const prisma = new PrismaClient();

export interface MembershipInfo {
  name: string;
  currentPlan: {
    id: string;
    name: string;
    startDate: string;
    expiryDate: string;
    remainingDays: number;
    status: 'active' | 'expiring_soon' | 'expired';
  } | null;
}

/**
 * Get user membership information for personalized chat responses
 */
export async function getUserMembership(userId: string): Promise<MembershipInfo | null> {
  try {
    // Fetch user with active subscription
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          where: {
            status: {
              in: ['ACTIVE', 'EXPIRED', 'CANCELLED'], // Valid enum values only
            },
          },
          orderBy: {
            endDate: 'desc',
          },
          take: 1,
          include: {
            plan: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // If no active subscription, return user with no plan
    if (!user.subscriptions || user.subscriptions.length === 0) {
      return {
        name: user.name,
        currentPlan: null,
      };
    }

    const subscription = user.subscriptions[0];
    const remainingDays = calculateRemainingDays(subscription.endDate);
    const status = determineSubscriptionStatus(remainingDays, subscription.status);

    return {
      name: user.name,
      currentPlan: {
        id: subscription.id,
        name: subscription.plan.title,
        startDate: subscription.startDate.toISOString(),
        expiryDate: subscription.endDate.toISOString(),
        remainingDays,
        status,
      },
    };
  } catch (error) {
    console.error('Error fetching user membership:', error);
    return null;
  }
}

/**
 * Calculate remaining days until subscription expires
 */
export function calculateRemainingDays(expiryDate: Date): number {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays); // Return 0 if expired
}

/**
 * Determine subscription status based on remaining days
 */
export function determineSubscriptionStatus(
  remainingDays: number,
  currentStatus: string
): 'active' | 'expiring_soon' | 'expired' {
  if (remainingDays <= 0) {
    return 'expired';
  } else if (remainingDays <= 7) {
    return 'expiring_soon';
  } else {
    return 'active';
  }
}

/**
 * Build user context for RAG service
 */
export async function buildUserContext(userId: string): Promise<UserContext | undefined> {
  const membership = await getUserMembership(userId);

  if (!membership) {
    return undefined;
  }

  // Fetch user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) {
    return undefined;
  }

  return {
    userId,
    name: membership.name,
    email: user.email,
    currentPlan: membership.currentPlan || undefined,
  };
}

/**
 * Check if user has active membership
 */
export async function hasActiveMembership(userId: string): Promise<boolean> {
  const membership = await getUserMembership(userId);
  return membership?.currentPlan?.status === 'active' || membership?.currentPlan?.status === 'expiring_soon';
}

/**
 * Get membership expiry message for user
 */
export function getMembershipExpiryMessage(membership: MembershipInfo): string {
  if (!membership.currentPlan) {
    return `Hi ${membership.name}! You don't have an active membership yet. Would you like to know about our membership plans?`;
  }

  const { currentPlan } = membership;
  const expiryDate = new Date(currentPlan.expiryDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  switch (currentPlan.status) {
    case 'active':
      return `Your ${currentPlan.name} membership is active and will expire on ${expiryDate}. You have ${currentPlan.remainingDays} days remaining.`;

    case 'expiring_soon':
      return `⚠️ Your ${currentPlan.name} membership is expiring soon on ${expiryDate}. You have only ${currentPlan.remainingDays} days remaining. Would you like to renew?`;

    case 'expired':
      return `❌ Your ${currentPlan.name} membership expired on ${expiryDate}. Please renew your membership to continue enjoying our facilities. Would you like to know about our current plans?`;

    default:
      return `Your ${currentPlan.name} membership expires on ${expiryDate}.`;
  }
}
