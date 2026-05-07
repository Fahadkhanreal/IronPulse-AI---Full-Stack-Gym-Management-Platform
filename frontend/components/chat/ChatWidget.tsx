'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Dumbbell } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  const widget = (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: isMobile ? '80px' : '90px',
            right: isMobile ? '10px' : '20px',
            left: isMobile ? '10px' : 'auto',
            width: isMobile ? 'calc(100vw - 20px)' : 'calc(100vw - 40px)',
            maxWidth: isMobile ? '100%' : '380px',
            height: isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 160px)',
            maxHeight: isMobile ? '500px' : '550px',
            zIndex: 999998,
          }}
        >
          <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} isMobile={isMobile} />
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
