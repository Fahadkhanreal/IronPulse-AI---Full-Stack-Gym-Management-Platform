'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Dumbbell } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const widget = (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: 'calc(100vw - 40px)',
            maxWidth: '380px',
            height: 'calc(100vh - 160px)',
            maxHeight: '550px',
            zIndex: 999998,
          }}
        >
          <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
      )}

      {/* Button - Always visible at viewport bottom-right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316 0%, #ef4444 50%, #ec4899 100%)',
          boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          zIndex: 999999,
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        aria-label={isOpen ? 'Close Gym Assistant' : 'Open Gym Assistant'}
      >
        {isOpen ? (
          <X style={{ width: '28px', height: '28px', color: 'white' }} strokeWidth={2.5} />
        ) : (
          <Dumbbell style={{ width: '28px', height: '28px', color: 'white' }} />
        )}
      </button>
    </>
  );

  // Render directly in body using Portal
  return createPortal(widget, document.body);
}
