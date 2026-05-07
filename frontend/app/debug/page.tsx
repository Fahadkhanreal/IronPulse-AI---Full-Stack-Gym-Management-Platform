'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function DebugPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [healthCheck, setHealthCheck] = useState('');
  const [signupTest, setSignupTest] = useState('');

  useEffect(() => {
    // Check what base URL is being used
    setApiUrl(process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET');

    // Test health endpoint
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(data => setHealthCheck(JSON.stringify(data, null, 2)))
      .catch(err => setHealthCheck('Error: ' + err.message));

    // Test signup endpoint through our API client
    api.post('/auth/signup', {
      name: 'Debug Test',
      email: 'debug@test.com',
      password: 'DebugPass123'
    })
      .then(data => setSignupTest(JSON.stringify(data, null, 2)))
      .catch(err => setSignupTest('Error: ' + (err.message || JSON.stringify(err))));
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>

      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Environment Variable:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">
            NEXT_PUBLIC_API_BASE_URL = {apiUrl}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Direct Health Check (fetch):</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
            {healthCheck || 'Loading...'}
          </pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold mb-2">Signup Test (via API client):</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40">
            {signupTest || 'Loading...'}
          </pre>
        </div>

        <div className="border p-4 rounded bg-yellow-50">
          <h2 className="font-bold mb-2">Expected Full URL:</h2>
          <pre className="text-sm">
            {apiUrl}/auth/signup
          </pre>
        </div>
      </div>
    </div>
  );
}
