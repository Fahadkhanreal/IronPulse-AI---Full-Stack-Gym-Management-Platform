/**
 * Chat Types for Frontend
 * Matches backend API contracts
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatRequest {
  message: string;
  userId?: string;
  conversationId?: string;
}

export interface ChatMetadata {
  tokensUsed?: number;
  responseTime: number;
  retrievedDocs?: number;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    metadata: ChatMetadata;
  };
  error?: string;
  code?: string;
}

export interface StreamEvent {
  type: 'start' | 'token' | 'done' | 'error';
  content?: string;
  conversationId?: string;
  metadata?: ChatMetadata;
  message?: string;
  code?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  conversationId: string | null;
}

export interface UseChatOptions {
  apiUrl?: string;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}
