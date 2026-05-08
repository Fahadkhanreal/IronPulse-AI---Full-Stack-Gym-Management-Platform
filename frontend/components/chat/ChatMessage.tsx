'use client';

import { ChatMessage as ChatMessageType } from '@/types/chat.types';
import { User, Dumbbell, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export default function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{
        gap: '8px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Avatar */}
      <div
        className={`flex items-center justify-center rounded-full ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
            : 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white'
        }`}
        style={{
          width: '28px',
          height: '28px',
          minWidth: '28px',
          flexShrink: 0,
        }}
      >
        {isUser ? <User className="h-3.5 w-3.5" /> : <Dumbbell className="h-3.5 w-3.5" />}
      </div>

      {/* Message Content */}
      <div
        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
        style={{
          gap: '4px',
          maxWidth: 'calc(100% - 36px)',
          minWidth: 0,
          flex: '1',
          boxSizing: 'border-box',
        }}
      >
        <div
          className={`rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
              : 'bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
          }`}
          style={{
            padding: '8px 12px',
            maxWidth: '100%',
            width: 'fit-content',
            boxSizing: 'border-box',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
          }}
        >
          {isUser ? (
            // User messages: plain text
            <p
              className="whitespace-pre-wrap text-sm"
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {message.content}
            </p>
          ) : (
            // Assistant messages: markdown with syntax highlighting
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              style={{
                maxWidth: '100%',
                overflowX: 'auto',
                wordWrap: 'break-word',
              }}
            >
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const inline = !match;
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{ maxWidth: '100%', overflowX: 'auto' }}
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0" style={{ wordWrap: 'break-word' }}>{children}</p>,
                  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      style={{ wordWrap: 'break-word' }}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Streaming indicator */}
              {isStreaming && message.content.length > 0 && (
                <span className="inline-block h-4 w-1 animate-pulse bg-gray-900 dark:bg-gray-100"></span>
              )}

              {/* Loading indicator for empty streaming message */}
              {isStreaming && message.content.length === 0 && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {message.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}
