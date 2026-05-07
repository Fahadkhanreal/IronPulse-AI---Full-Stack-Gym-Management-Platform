import 'dotenv/config';
import { chatNonStream } from '../src/controllers/chat.controller';
import { Request, Response } from 'express';

async function testChatController() {
  console.log('🧪 Testing Chat Controller\n');

  // Mock request
  const req = {
    body: {
      message: 'What are your gym timings?',
    },
  } as Request;

  // Mock response
  let responseData: any = null;
  let statusCode = 200;

  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    json: (data: any) => {
      responseData = data;
      return res;
    },
  } as unknown as Response;

  try {
    await chatNonStream(req, res);

    console.log('Status Code:', statusCode);
    console.log('Response:', JSON.stringify(responseData, null, 2));

    if (responseData?.success) {
      console.log('\n✅ Chat controller test passed!');
    } else {
      console.log('\n❌ Chat controller returned error:', responseData?.error);
    }
  } catch (error) {
    console.error('\n❌ Chat controller test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

testChatController();
