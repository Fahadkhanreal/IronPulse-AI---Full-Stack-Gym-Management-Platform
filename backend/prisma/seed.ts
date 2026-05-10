import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ironpulse.com' },
    update: {
      role: 'ADMIN', // Force update role to ADMIN
    },
    create: {
      name: 'Admin User',
      email: 'admin@ironpulse.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
    },
  });

  // Create test member user
  const hashedMemberPassword = await bcrypt.hash('member123', 10);
  const memberUser = await prisma.user.upsert({
    where: { email: 'member@test.com' },
    update: {},
    create: {
      name: 'Test Member',
      email: 'member@test.com',
      password: hashedMemberPassword,
      role: 'MEMBER',
    },
  });

  console.log('✅ Created users:', { adminUser: adminUser.email, memberUser: memberUser.email });

  // Create sample plans
  const basicPlan = await prisma.plan.upsert({
    where: { id: 'basic-plan-seed' },
    update: {},
    create: {
      id: 'basic-plan-seed',
      title: 'Basic',
      price: 29.99,
      duration: 1,
      features: [
        'Access to gym equipment',
        'Locker room access',
        'Free Wi-Fi',
        'Open 7 days a week',
      ],
    },
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { id: 'premium-plan-seed' },
    update: {},
    create: {
      id: 'premium-plan-seed',
      title: 'Premium',
      price: 49.99,
      duration: 1,
      features: [
        'All Basic features',
        'Group fitness classes',
        'Personal trainer consultation (1/month)',
        'Nutrition guidance',
        'Sauna access',
      ],
    },
  });

  const elitePlan = await prisma.plan.upsert({
    where: { id: 'elite-plan-seed' },
    update: {},
    create: {
      id: 'elite-plan-seed',
      title: 'Elite',
      price: 79.99,
      duration: 1,
      features: [
        'All Premium features',
        'Unlimited personal training sessions',
        'Advanced nutrition planning',
        'Priority booking',
        'Guest passes (2/month)',
        'Massage therapy (1/month)',
      ],
    },
  });

  console.log('✅ Created plans:', { basicPlan, premiumPlan, elitePlan });

  // Create sample trainers
  const trainers = await Promise.all([
    prisma.trainer.upsert({
      where: { id: 'trainer-1-seed' },
      update: {},
      create: {
        id: 'trainer-1-seed',
        name: 'John Smith',
        specialization: 'Strength Training',
        experience: 8,
        image: '/images/trainers/john-smith.jpg',
        bio: 'Certified strength and conditioning specialist with 8 years of experience helping clients build muscle and increase power.',
      },
    }),
    prisma.trainer.upsert({
      where: { id: 'trainer-2-seed' },
      update: {},
      create: {
        id: 'trainer-2-seed',
        name: 'Sarah Johnson',
        specialization: 'Yoga & Flexibility',
        experience: 6,
        image: '/images/trainers/sarah-johnson.jpg',
        bio: 'Experienced yoga instructor specializing in flexibility, balance, and mindfulness practices.',
      },
    }),
    prisma.trainer.upsert({
      where: { id: 'trainer-3-seed' },
      update: {},
      create: {
        id: 'trainer-3-seed',
        name: 'Mike Chen',
        specialization: 'HIIT & Cardio',
        experience: 5,
        image: '/images/trainers/mike-chen.jpg',
        bio: 'High-intensity interval training expert focused on fat loss and cardiovascular fitness.',
      },
    }),
    prisma.trainer.upsert({
      where: { id: 'trainer-4-seed' },
      update: {},
      create: {
        id: 'trainer-4-seed',
        name: 'Emily Davis',
        specialization: 'Nutrition & Wellness',
        experience: 7,
        image: '/images/trainers/emily-davis.jpg',
        bio: 'Certified nutritionist and wellness coach helping clients achieve their health goals through balanced nutrition.',
      },
    }),
    prisma.trainer.upsert({
      where: { id: 'trainer-5-seed' },
      update: {},
      create: {
        id: 'trainer-5-seed',
        name: 'David Martinez',
        specialization: 'CrossFit',
        experience: 10,
        image: '/images/trainers/david-martinez.jpg',
        bio: 'CrossFit Level 3 trainer with a decade of experience in functional fitness and athletic performance.',
      },
    }),
    prisma.trainer.upsert({
      where: { id: 'trainer-6-seed' },
      update: {},
      create: {
        id: 'trainer-6-seed',
        name: 'Lisa Anderson',
        specialization: 'Pilates & Core',
        experience: 4,
        image: '/images/trainers/lisa-anderson.jpg',
        bio: 'Pilates instructor specializing in core strength, posture correction, and injury rehabilitation.',
      },
    }),
  ]);

  console.log('✅ Created trainers:', trainers.length);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
