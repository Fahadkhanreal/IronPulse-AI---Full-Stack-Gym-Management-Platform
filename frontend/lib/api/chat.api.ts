import { ChatRequest, ChatResponse, StreamEvent } from '@/types/chat.types';

// Use network IP for mobile testing
const API_BASE_URL = 'http://192.168.0.102:5000/api/v1';

/**
 * Send a chat message with SSE streaming
 * Returns an async generator that yields tokens as they arrive
 */
export async function* sendChatMessageStream(
  request: ChatRequest,
  token?: string
): AsyncGenerator<StreamEvent, void, unknown> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      // Decode the chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6); // Remove 'data: ' prefix

          try {
            const event: StreamEvent = JSON.parse(data);
            yield event;

            // Stop if we receive done or error event
            if (event.type === 'done' || event.type === 'error') {
              return;
            }
          } catch (e) {
            // Failed to parse SSE event
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Send a chat message without streaming (fallback)
 * Returns the complete response
 */
export async function sendChatMessage(
  request: ChatRequest,
  token?: string
): Promise<ChatResponse> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/chat/non-stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

/**
 * Get the latest conversation for the authenticated user
 */
export async function getLatestConversation(token: string): Promise<any> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const response = await fetch(`${API_BASE_URL}/chat/history/latest`, {
    method: 'GET',
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

/**
 * Check if the chat API is available
 */
export async function checkChatHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/v1', '')}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
