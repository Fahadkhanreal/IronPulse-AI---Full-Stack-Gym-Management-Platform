import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fetch real-time gym data from database
 * This ensures chatbot provides accurate, up-to-date information
 */

export interface GymDataContext {
  trainers: Array<{
    id: string;
    name: string;
    specialization: string;
    experience: number;
    bio: string | null;
  }>;
  plans: Array<{
    id: string;
    title: string;
    price: number;
    duration: number;
    features: string[];
  }>;
  testimonials: Array<{
    id: string;
    name: string;
    text: string;
    rating: number;
  }>;
  stats: {
    totalTrainers: number;
    totalPlans: number;
    totalTestimonials: number;
  };
}

/**
 * Get all real-time gym data from database
 */
export async function getGymData(): Promise<GymDataContext> {
  try {
    const [trainers, plans, testimonials] = await Promise.all([
      prisma.trainer.findMany({
        select: {
          id: true,
          name: true,
          specialization: true,
          experience: true,
          bio: true,
        },
      }),
      prisma.plan.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          duration: true,
          features: true,
        },
      }),
      prisma.testimonial.findMany({
        select: {
          id: true,
          name: true,
          text: true,
          rating: true,
        },
        take: 10, // Latest 10 testimonials
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      trainers,
      plans,
      testimonials,
      stats: {
        totalTrainers: trainers.length,
        totalPlans: plans.length,
        totalTestimonials: testimonials.length,
      },
    };
  } catch (error) {
    console.error('Error fetching gym data:', error);
    return {
      trainers: [],
      plans: [],
      testimonials: [],
      stats: {
        totalTrainers: 0,
        totalPlans: 0,
        totalTestimonials: 0,
      },
    };
  }
}

/**
 * Format gym data into readable context for chatbot
 */
export function formatGymDataForContext(gymData: GymDataContext): string {
  let context = '**REAL-TIME GYM DATA (From Database)**:\n\n';

  // Trainers
  if (gymData.trainers.length > 0) {
    context += `**Available Trainers (${gymData.stats.totalTrainers} total)**:\n`;
    gymData.trainers.forEach((trainer, index) => {
      context += `${index + 1}. ${trainer.name} - ${trainer.specialization} (${trainer.experience} years experience)\n`;
      if (trainer.bio) {
        context += `   Bio: ${trainer.bio}\n`;
      }
    });
    context += '\n';
  } else {
    context += '**Trainers**: No trainers currently available in the database.\n\n';
  }

  // Plans
  if (gymData.plans.length > 0) {
    context += `**Membership Plans (${gymData.stats.totalPlans} total)**:\n`;
    gymData.plans.forEach((plan, index) => {
      context += `${index + 1}. ${plan.title} - PKR ${plan.price}/${plan.duration} month(s)\n`;
      context += `   Features: ${plan.features.join(', ')}\n`;
    });
    context += '\n';
  } else {
    context += '**Plans**: No membership plans currently available.\n\n';
  }

  // Testimonials
  if (gymData.testimonials.length > 0) {
    context += `**Recent Testimonials (${gymData.stats.totalTestimonials} total)**:\n`;
    gymData.testimonials.slice(0, 5).forEach((testimonial, index) => {
      context += `${index + 1}. ${testimonial.name} (${testimonial.rating}/5 stars): "${testimonial.text}"\n`;
    });
    context += '\n';
  }

  return context;
}

/**
 * Check if query is asking about trainers, plans, or testimonials
 */
export function isQueryAboutGymData(query: string): boolean {
  const keywords = [
    'trainer', 'trainers', 'coach', 'instructor',
    'plan', 'plans', 'membership', 'package', 'price', 'pricing',
    'testimonial', 'review', 'feedback', 'rating',
    'kitne trainer', 'kitna trainer', 'kon trainer',
    'kitne plan', 'kitna plan', 'kon plan',
  ];

  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword));
}
