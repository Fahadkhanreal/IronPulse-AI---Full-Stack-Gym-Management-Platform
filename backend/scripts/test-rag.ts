import 'dotenv/config';
import { generateRAGResponse } from '../src/services/rag.service';

async function testRAG() {
  console.log('🧪 Testing RAG Service\n');

  try {
    console.log('Sending test query: "What are your gym timings?"\n');

    const response = await generateRAGResponse('What are your gym timings?', {});

    console.log('✅ RAG Response received:\n');
    console.log('Content:', response.content);
    console.log('\nMetadata:');
    console.log('- Tokens used:', response.tokensUsed);
    console.log('- Response time:', response.responseTime, 'ms');
    console.log('- Retrieved docs:', response.retrievedDocs.length);

    if (response.retrievedDocs.length > 0) {
      console.log('\nRetrieved documents:');
      response.retrievedDocs.forEach((doc, i) => {
        console.log(`\n${i + 1}. [${doc.metadata.category}] ${doc.metadata.title}`);
        console.log(`   Similarity: ${doc.similarity.toFixed(4)}`);
        console.log(`   Content: ${doc.content.substring(0, 100)}...`);
      });
    }

    console.log('\n✅ RAG test passed!');
  } catch (error) {
    console.error('\n❌ RAG test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testRAG();
