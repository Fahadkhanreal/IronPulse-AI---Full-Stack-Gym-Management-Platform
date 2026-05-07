import 'dotenv/config';
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateEmbedding } from '../src/services/embedding.service';
import { storeDocument, deleteDocumentsBySource, createVectorIndex } from '../src/services/vector.service';
import { DocumentMetadata } from '../src/types/chat.types';

interface KnowledgeItem {
  title: string;
  content: string;
  category: 'timing' | 'plan' | 'trainer' | 'facility' | 'faq' | 'workout';
  language?: 'en' | 'ur';
  metadata?: Record<string, any>;
}

interface KnowledgeFile {
  source: string;
  items: KnowledgeItem[];
}

const DATA_DIR = join(__dirname, '../data');
const KNOWLEDGE_FILES = [
  'gym-timings.json',
  'gym-plans.json',
  'trainers.json',
  'facilities.json',
  'workout-guides.json',
  'exercises.json',
  'fitness-advice.json',
];

async function seedKnowledge() {
  console.log('🌱 Starting knowledge base seeding...\n');

  try {
    // Step 1: Load all knowledge files
    console.log('📂 Loading knowledge files...');
    const allItems: Array<{ item: KnowledgeItem; source: string }> = [];

    for (const filename of KNOWLEDGE_FILES) {
      const filePath = join(DATA_DIR, filename);
      try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const data: KnowledgeFile = JSON.parse(fileContent);

        console.log(`  ✓ Loaded ${filename}: ${data.items.length} items`);

        for (const item of data.items) {
          allItems.push({ item, source: data.source });
        }
      } catch (error) {
        console.warn(`  ⚠️  Could not load ${filename}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    console.log(`\n📊 Total items to ingest: ${allItems.length}\n`);

    if (allItems.length === 0) {
      console.log('❌ No items to ingest. Please create knowledge files in backend/data/');
      process.exit(1);
    }

    // Step 2: Clean up existing documents from these sources
    console.log('🧹 Cleaning up existing documents...');
    const sources = [...new Set(allItems.map(({ source }) => source))];

    for (const source of sources) {
      const deleted = await deleteDocumentsBySource(source);
      console.log(`  ✓ Deleted ${deleted} documents from source: ${source}`);
    }

    // Step 3: Generate embeddings and prepare documents
    console.log('\n🔢 Generating embeddings...');
    const documents: Array<{
      content: string;
      metadata: DocumentMetadata;
      embedding: number[];
    }> = [];

    let processed = 0;
    for (const { item, source } of allItems) {
      processed++;
      process.stdout.write(`  Processing ${processed}/${allItems.length}...\r`);

      // Generate embedding for the content
      const embedding = await generateEmbedding(item.content, {
        inputType: 'search_document',
      });

      // Build metadata
      const metadata: DocumentMetadata = {
        category: item.category,
        source,
        language: item.language || 'en',
        title: item.title,
        lastUpdated: new Date().toISOString(),
        ...item.metadata,
      };

      documents.push({
        content: item.content,
        metadata,
        embedding,
      });

      // Delay to respect Cohere rate limit (40 calls/minute = 1.5 seconds per call)
      // Adding 2 seconds to be safe
      if (processed < allItems.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`\n  ✓ Generated ${documents.length} embeddings\n`);

    // Step 4: Store documents in database
    console.log('💾 Storing documents in database...');
    const ids: number[] = [];

    for (let i = 0; i < documents.length; i++) {
      process.stdout.write(`  Storing ${i + 1}/${documents.length}...\r`);
      const id = await storeDocument(
        documents[i].content,
        documents[i].metadata,
        documents[i].embedding
      );
      ids.push(id);
    }

    console.log(`\n  ✓ Stored ${ids.length} documents\n`);

    // Step 5: Create vector index for better performance
    console.log('🔍 Creating vector index...');
    await createVectorIndex();

    // Step 6: Summary
    console.log('\n✅ Knowledge base seeding completed!\n');
    console.log('Summary:');
    console.log(`  - Total documents: ${ids.length}`);
    console.log(`  - Sources: ${sources.join(', ')}`);

    // Count by category
    const categoryCounts: Record<string, number> = {};
    for (const { item } of allItems) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    console.log('  - By category:');
    for (const [category, count] of Object.entries(categoryCounts)) {
      console.log(`    • ${category}: ${count}`);
    }

    console.log('\n🎉 Ready to answer questions!\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run seeding
seedKnowledge()
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
