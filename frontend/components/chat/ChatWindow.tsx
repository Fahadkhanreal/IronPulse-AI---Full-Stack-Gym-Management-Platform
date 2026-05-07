'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { ChatMessage as ChatMessageType, StreamEvent } from '@/types/chat.types';
import { sendChatMessageStream, getLatestConversation } from '@/lib/api/chat.api';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export default function ChatWindow({ isOpen, onClose, isMobile = false }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m IronPulse AI, your personal fitness assistant. 💪 How can I help you today? Ask me about gym timings, membership plans, trainers, or workout advice!',
      timestamp: new Date(),
    },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load latest conversation on mount (for logged-in users)
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadLatestConversation();
    }
  }, [isOpen]);

  const loadLatestConversation = async () => {
    const token = localStorage.getItem('token');

    // Only load for logged-in users
    if (!token) {
      setHistoryLoaded(true);
      return;
    }

    setIsLoadingHistory(true);

    try {
      const response = await getLatestConversation(token);

      if (response.success && response.data.conversation) {
        const conv = response.data.conversation;

        // Check if messages exist and are valid
        if (conv.messages && Array.isArray(conv.messages) && conv.messages.length > 0) {
          // Convert stored messages to ChatMessageType format
          const loadedMessages: ChatMessageType[] = conv.messages.map((msg: any, index: number) => ({
            id: `loaded-${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));

          setMessages(loadedMessages);
          setConversationId(conv.id);
        }
      }
    } catch (err: any) {
      // If 401 (unauthorized), token is invalid - clear it and start fresh
      if (err.message?.includes('Invalid or expired token') || err.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Don't show error to user, just start fresh with welcome message
    } finally {
      setIsLoadingHistory(false);
      setHistoryLoaded(true);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    // Clear any previous errors
    setError(null);

    // Add user message
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    try {
      // Get auth token if available
      const token = localStorage.getItem('token') || undefined;

      // Stream the response
      const stream = sendChatMessageStream(
        {
          message: content.trim(),
          conversationId: conversationId || undefined,
        },
        token
      );

      let fullContent = '';

      for await (const event of stream) {
        if (event.type === 'start' && event.conversationId) {
          // Save conversation ID for future messages
          if (event.conversationId !== 'new') {
            setConversationId(event.conversationId);
          }
        } else if (event.type === 'token' && event.content) {
          fullContent += event.content;

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullContent }
                : msg
            )
          );
        } else if (event.type === 'error') {
          setError(event.message || 'An error occurred while processing your message.');

          // Remove the empty assistant message
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
          break;
        } else if (event.type === 'done') {
          // Save conversation ID if returned
          if (event.conversationId) {
            setConversationId(event.conversationId);
          }
          // Streaming complete
          break;
        }
      }

      // If no content was received, show error
      if (fullContent.length === 0) {
        setError('No response received from the server.');
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');

      // Remove the empty assistant message
      setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessageId));
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I\'m IronPulse AI, your personal fitness assistant. 💪 How can I help you today?',
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setConversationId(null); // Start a new conversation
    setHistoryLoaded(false); // Allow reloading history
  };

  if (!isOpen) return null;

  return (
    <div
      className="flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden h-full w-full"
      style={{
        paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : '0',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white shadow-md flex-shrink-0"
        style={{
          padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1rem',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <span className="text-base">💪</span>
          </div>
          <div>
            <h3 className="font-semibold text-xs">IronPulse AI</h3>
            <p className="text-[9px] text-white/90">
              {isLoadingHistory ? 'Loading...' : isStreaming ? 'Typing...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* New Chat Button */}
          {conversationId && !isMobile && (
            <button
              onClick={handleClearChat}
              disabled={isStreaming}
              className="rounded-full p-1.5 transition-colors hover:bg-white/20 active:bg-white/30 disabled:opacity-50"
              aria-label="Start new chat"
              title="Start new chat"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 transition-colors hover:bg-white/20 active:bg-white/30"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900"
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          padding: isMobile ? '0.5rem' : '0.75rem',
        }}
      >
        {/* Loading History Indicator */}
        {isLoadingHistory && (
          <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading conversation history...</span>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isStreaming={isStreaming && message.id === streamingMessageId}
          />
        ))}

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
        style={{
          padding: isMobile ? '0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom))' : '0.75rem',
        }}
      >
        <ChatInput
          onSend={handleSendMessage}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Waiting for response...' : 'Ask me anything...'}
        />

        {/* Clear Chat Button */}
        <button
          onClick={handleClearChat}
          disabled={isStreaming}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
        >
          Clear chat
        </button>
      </div>
    </div>
  );
}
