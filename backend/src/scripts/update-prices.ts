import prisma from '../config/prisma';

async function updatePlanPrices() {
  try {
    console.log('🔄 Updating plan prices to PKR...');

    // Update Basic Plan
    await prisma.plan.updateMany({
      where: { title: { contains: 'Basic', mode: 'insensitive' } },
      data: { price: 1500 },
    });
    console.log('✅ Basic Plan updated to PKR 1500');

    // Update Elite Plan
    await prisma.plan.updateMany({
      where: { title: { contains: 'Elite', mode: 'insensitive' } },
      data: { price: 5000 },
    });
    console.log('✅ Elite Plan updated to PKR 5000');

    // Update Premium Plan
    await prisma.plan.updateMany({
      where: { title: { contains: 'Premium', mode: 'insensitive' } },
      data: { price: 3000 },
    });
    console.log('✅ Premium Plan updated to PKR 3000');

    console.log('🎉 All plan prices updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
}

updatePlanPrices();
