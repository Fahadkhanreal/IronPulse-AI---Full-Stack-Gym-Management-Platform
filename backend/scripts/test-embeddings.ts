import 'dotenv/config';
import { generateEmbedding, generateEmbeddings, isCohereConfigured } from '../src/services/embedding.service';

async function testEmbeddingGeneration() {
  console.log('🧪 Testing Embedding Generation Service\n');

  // Check if Cohere is configured
  if (!isCohereConfigured()) {
    console.error('❌ COHERE_API_KEY is not configured in .env file');
    console.log('Please add your Cohere API key to backend/.env:');
    console.log('COHERE_API_KEY="your-api-key-here"');
    process.exit(1);
  }

  console.log('✅ Cohere API key is configured\n');

  try {
    // Test 1: Single embedding generation
    console.log('Test 1: Generating single embedding...');
    const sampleText = 'IronPulse Gym is open from 6 AM to 10 PM daily.';
    const embedding = await generateEmbedding(sampleText, { inputType: 'search_document' });

    console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
    console.log(`   First 5 values: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);
    console.log(`   Sample text: "${sampleText}"\n`);

    // Verify embedding dimensions
    if (embedding.length !== 1024) {
      throw new Error(`Expected 1024 dimensions, got ${embedding.length}`);
    }

    // Test 2: Batch embedding generation
    console.log('Test 2: Generating batch embeddings...');
    const sampleTexts = [
      'Our Basic Plan costs 3000 PKR per month.',
      'Premium Plan includes 24/7 access and personal trainer sessions.',
      'We have certified trainers specializing in strength training.',
    ];

    const embeddings = await generateEmbeddings(sampleTexts, { inputType: 'search_document' });

    console.log(`✅ Generated ${embeddings.length} embeddings`);
    for (let i = 0; i < embeddings.length; i++) {
      console.log(`   Embedding ${i + 1}: ${embeddings[i].length} dimensions`);
    }
    console.log();

    // Verify all embeddings have correct dimensions
    for (const emb of embeddings) {
      if (emb.length !== 1024) {
        throw new Error(`Expected 1024 dimensions, got ${emb.length}`);
      }
    }

    // Test 3: Query embedding (different input type)
    console.log('Test 3: Generating query embedding...');
    const queryText = 'What are your gym timings?';
    const queryEmbedding = await generateEmbedding(queryText, { inputType: 'search_query' });

    console.log(`✅ Generated query embedding with ${queryEmbedding.length} dimensions`);
    console.log(`   Query: "${queryText}"\n`);

    // Test 4: Calculate cosine similarity between document and query
    console.log('Test 4: Calculating similarity between document and query...');
    const docEmbedding = await generateEmbedding(
      'IronPulse Gym is open from 6 AM to 10 PM daily, including weekends.',
      { inputType: 'search_document' }
    );

    const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
    console.log(`✅ Cosine similarity: ${similarity.toFixed(4)}`);
    console.log(`   (Higher values indicate more similar content)\n`);

    console.log('✅ All embedding tests passed!\n');
    console.log('Summary:');
    console.log('- Single embedding generation: ✓');
    console.log('- Batch embedding generation: ✓');
    console.log('- Query embedding generation: ✓');
    console.log('- Similarity calculation: ✓');
    console.log('\n🎉 Embedding service is working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

testEmbeddingGeneration()
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
