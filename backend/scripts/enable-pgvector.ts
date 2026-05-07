import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enablePgVector() {
  try {
    console.log('🔧 Enabling pgvector extension...');

    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');

    console.log('✅ pgvector extension enabled successfully');

    // Verify extension is installed
    const result = await prisma.$queryRawUnsafe<Array<{ extname: string }>>(
      "SELECT extname FROM pg_extension WHERE extname = 'vector';"
    );

    if (result.length > 0) {
      console.log('✅ Verified: pgvector extension is active');
    } else {
      console.log('⚠️  Warning: pgvector extension not found after installation');
    }
  } catch (error) {
    console.error('❌ Error enabling pgvector extension:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

enablePgVector()
  .catch((error) => {
    console.error('Failed to enable pgvector:', error);
    process.exit(1);
  });
