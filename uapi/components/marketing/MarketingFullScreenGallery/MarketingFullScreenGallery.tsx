"use client";

import React from 'react';
import type { Screenshot } from './marketing-types';

export interface FullScreenGalleryProps {
  images?: readonly Screenshot[];
  screenshots?: readonly Screenshot[];
  currentIndex?: number;
  initialIndex?: number;
  isOpen?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  layout?: string;
  maxItems?: number;
  autoPlay?: boolean;
  className?: string;
}

const MarketingFullScreenGallery: React.FC<FullScreenGalleryProps> = ({
  images,
  screenshots,
  currentIndex,
  initialIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
  className = '',
}) => {
  if (!isOpen) return null;

  const resolvedImages = screenshots ?? images ?? [];
  const activeIndex = currentIndex ?? initialIndex ?? 0;
  const currentImage = resolvedImages[activeIndex];

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 ${className}`}>
      <div className="relative max-w-7xl max-h-full p-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl z-10"
        >
          ×
        </button>

        {currentImage && (
          <img
            src={currentImage.src}
            alt={currentImage.alt || 'Gallery image'}
            className="max-w-full max-h-full object-contain"
          />
        )}

        {resolvedImages.length > 1 && (
          <>
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketingFullScreenGallery;
