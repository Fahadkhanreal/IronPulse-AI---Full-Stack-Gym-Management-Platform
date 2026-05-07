'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Dumbbell } from 'lucide-react';
import ChatWindow from './ChatWindow';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Track viewport height changes (for keyboard)
    const updateViewportHeight = () => {
      if (window.visualViewport) {
        setViewportHeight(window.visualViewport.height);
      } else {
        setViewportHeight(window.innerHeight);
      }
    };

    checkMobile();
    updateViewportHeight();

    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', updateViewportHeight);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewportHeight);
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', updateViewportHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewportHeight);
      }
    };
  }, []);

  if (!mounted) return null;

  // Calculate chat height based on viewport (for keyboard handling)
  const getChatHeight = () => {
    if (!isMobile) return 'calc(100vh - 160px)';

    // On mobile, use visual viewport height minus button space
    if (viewportHeight > 0) {
      return `${viewportHeight - 100}px`;
    }
    return 'calc(100vh - 100px)';
  };

  const widget = (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: isMobile ? '0' : 'auto',
            bottom: isMobile ? '0' : '90px',
            left: isMobile ? '0' : 'auto',
            right: isMobile ? '0' : '20px',
            width: isMobile ? '100%' : 'calc(100vw - 40px)',
            maxWidth: isMobile ? '100%' : '380px',
            height: isMobile ? getChatHeight() : 'calc(100vh - 160px)',
            maxHeight: isMobile ? '100%' : '550px',
            zIndex: 999998,
            transition: 'height 0.2s ease-out',
            overflow: 'hidden',
            margin: 0,
            padding: 0,
          }}
        >
          <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} isMobile={isMobile} />
        </div>
      )}

      {/* Button - Hide on mobile when chat is open */}
      {!(isMobile && isOpen) && (
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
      )}
    </>
  );

  // Render directly in body using Portal
  return createPortal(widget, document.body);
}
