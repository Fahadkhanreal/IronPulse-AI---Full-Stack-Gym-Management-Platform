'use client';

import { useState, useEffect } from 'react';
import { X, Dumbbell } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything on server
  if (!mounted) {
    return null;
  }

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <ChatWindow
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button"
        aria-label={isOpen ? "Close Gym Assistant" : "Open Gym Assistant"}
        type="button"
      >
        {isOpen ? (
          <X className="chatbot-icon" strokeWidth={2.5} />
        ) : (
          <Dumbbell className="chatbot-icon" />
        )}
      </button>

      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 0;
          right: 0;
          z-index: 999999;
          pointer-events: none;
        }

        .chatbot-window {
          position: fixed;
          bottom: 80px;
          right: 16px;
          width: calc(100vw - 32px);
          height: calc(100vh - 140px);
          max-width: 380px;
          max-height: 550px;
          pointer-events: auto;
          z-index: 999998;
        }

        .chatbot-button {
          position: fixed;
          bottom: 16px;
          right: 16px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%);
          box-shadow: 0 10px 40px rgba(239, 68, 68, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          pointer-events: auto;
          z-index: 999999;
          transition: transform 0.2s ease;
        }

        .chatbot-button:hover {
          transform: scale(1.1);
        }

        .chatbot-button:active {
          transform: scale(0.95);
        }

        .chatbot-icon {
          width: 28px;
          height: 28px;
          color: white;
        }

        @media (min-width: 640px) {
          .chatbot-window {
            bottom: 96px;
            right: 24px;
            width: 380px;
            height: 550px;
          }

          .chatbot-button {
            bottom: 24px;
            right: 24px;
            width: 64px;
            height: 64px;
          }

          .chatbot-icon {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>
    </div>
  );
}
