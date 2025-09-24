"use client";
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // BaseModal.tsx
const modalContent = (
  // make the overlay itself scrollable on very small screens
  <div className="fixed inset-0 z-[9999] overflow-y-auto">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      onClick={onClose}
      aria-hidden="true"
    />

    {/* Flex wrapper to center the panel but still allow page scroll */}
    <div className="min-h-full flex items-start sm:items-center justify-center p-4">
      {/* Modal panel */}
      <div
        className={`relative w-full ${sizeClasses[size]} mx-auto
                    bg-white dark:bg-gray-800 rounded-lg shadow-xl
                    max-h-[85vh]  /* cap the height */
                    flex flex-col  /* column layout */
                    ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header (non-scrolling) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Content (scrollable area) */}
        <div className="flex-1 overflow-y-auto p-6 overscroll-contain [--tw-scroll-gutter:stable]">
          {children}
        </div>
      </div>
    </div>
  </div>
);


  // Render modal using portal to body
  return createPortal(modalContent, document.body);
};

export default BaseModal;