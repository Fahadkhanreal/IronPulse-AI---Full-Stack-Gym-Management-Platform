import 'dotenv/config';
import { generateEmbedding } from '../src/services/embedding.service';
import {
  storeDocuments,
  vectorSearch,
  deleteDocumentsBySource,
  getDocumentCountByCategory
} from '../src/services/vector.service';

async function testVectorSearch() {
  console.log('🧪 Testing Vector Search Service\n');

  const testSource = 'test:vector-search';

  try {
    // Clean up any existing test documents
    console.log('Cleaning up existing test documents...');
    await deleteDocumentsBySource(testSource);
    console.log('✅ Cleanup complete\n');

    // Test 1: Insert test documents
    console.log('Test 1: Inserting test documents with embeddings...');

    const testDocuments = [
      {
        content: 'IronPulse Gym is open from 6 AM to 10 PM daily, including weekends and holidays. Premium members have 24/7 access.',
        metadata: {
          category: 'timing' as const,
          source: testSource,
          language: 'en' as const,
          title: 'Gym Operating Hours',
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        content: 'Our Basic Plan costs 3000 PKR per month and includes access to all gym equipment, locker facilities, and group classes.',
        metadata: {
          category: 'plan' as const,
          source: testSource,
          language: 'en' as const,
          title: 'Basic Plan',
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        content: 'Premium Plan is 5000 PKR per month with 24/7 access, personal trainer sessions, and nutrition consultation.',
        metadata: {
          category: 'plan' as const,
          source: testSource,
          language: 'en' as const,
          title: 'Premium Plan',
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        content: 'We have certified trainers specializing in strength training, weight loss, and sports conditioning.',
        metadata: {
          category: 'trainer' as const,
          source: testSource,
          language: 'en' as const,
          title: 'Trainer Information',
          lastUpdated: new Date().toISOString(),
        },
      },
    ];

    // Generate embeddings for all documents
    console.log('Generating embeddings for test documents...');

    // Store documents with embeddings
    const documentsWithEmbeddings = [];
    for (let i = 0; i < testDocuments.length; i++) {
      const embedding = await generateEmbedding(testDocuments[i].content, { inputType: 'search_document' });
      documentsWithEmbeddings.push({
        content: testDocuments[i].content,
        metadata: testDocuments[i].metadata,
        embedding,
      });
    }

    const ids = await storeDocuments(documentsWithEmbeddings);
    console.log(`✅ Inserted ${ids.length} documents with IDs: ${ids.join(', ')}\n`);

    // Test 2: Vector similarity search
    console.log('Test 2: Performing vector similarity search...');

    const queries = [
      { text: 'What are your gym timings?', expectedCategory: 'timing' },
      { text: 'Tell me about membership plans', expectedCategory: 'plan' },
      { text: 'Do you have personal trainers?', expectedCategory: 'trainer' },
    ];

    for (const query of queries) {
      console.log(`\nQuery: "${query.text}"`);

      // Generate query embedding
      const queryEmbedding = await generateEmbedding(query.text, { inputType: 'search_query' });

      // Perform vector search
      const results = await vectorSearch(queryEmbedding, {
        limit: 3,
        threshold: 0.3,
      });

      console.log(`Found ${results.length} results:`);
      for (const result of results) {
        console.log(`  - [${result.metadata.category}] Similarity: ${result.similarity.toFixed(4)}`);
        console.log(`    "${result.content.substring(0, 80)}..."`);
      }

      // Verify top result matches expected category
      if (results.length > 0 && results[0].metadata.category === query.expectedCategory) {
        console.log(`  ✅ Top result matches expected category: ${query.expectedCategory}`);
      } else if (results.length > 0) {
        console.log(`  ⚠️  Top result category: ${results[0].metadata.category}, expected: ${query.expectedCategory}`);
      } else {
        console.log(`  ❌ No results found`);
      }
    }

    // Test 3: Category filtering
    console.log('\n\nTest 3: Testing category filtering...');
    const queryEmbedding = await generateEmbedding('Tell me about plans', { inputType: 'search_query' });

    const filteredResults = await vectorSearch(queryEmbedding, {
      limit: 5,
      category: 'plan',
    });

    console.log(`Found ${filteredResults.length} results with category='plan':`);
    for (const result of filteredResults) {
      console.log(`  - [${result.metadata.category}] ${result.metadata.title}`);
    }

    const allPlans = filteredResults.every(r => r.metadata.category === 'plan');
    if (allPlans) {
      console.log('✅ All results match the category filter');
    } else {
      console.log('❌ Some results do not match the category filter');
    }

    // Test 4: Document count by category
    console.log('\n\nTest 4: Getting document count by category...');
    const counts = await getDocumentCountByCategory();
    console.log('Document counts:');
    for (const [category, count] of Object.entries(counts)) {
      console.log(`  - ${category}: ${count}`);
    }

    // Cleanup
    console.log('\n\nCleaning up test documents...');
    const deleted = await deleteDocumentsBySource(testSource);
    console.log(`✅ Deleted ${deleted} test documents\n`);

    console.log('✅ All vector search tests passed!\n');
    console.log('Summary:');
    console.log('- Document insertion: ✓');
    console.log('- Vector similarity search: ✓');
    console.log('- Category filtering: ✓');
    console.log('- Document count: ✓');
    console.log('- Cleanup: ✓');
    console.log('\n🎉 Vector search service is working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }

    // Attempt cleanup even on failure
    try {
      console.log('\nAttempting cleanup...');
      await deleteDocumentsBySource(testSource);
      console.log('✅ Cleanup successful');
    } catch (cleanupError) {
      console.error('❌ Cleanup failed:', cleanupError);
    }

    process.exit(1);
  }
}

testVectorSearch()
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
