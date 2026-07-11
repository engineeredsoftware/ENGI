"use client";

import React from 'react';
import type { Screenshot } from './marketing-types';

export interface ThumbnailStackProps {
  images: readonly Screenshot[] | readonly string[];
  onThumbClick?: (index: number) => void;
  className?: string;
  maxVisible?: number;
  pad?: boolean;
  animationPaused?: boolean;
}

const MarketingThumbnailStack: React.FC<ThumbnailStackProps> = ({
  images,
  onThumbClick,
  className = '',
  maxVisible = 3,
  pad = false,
}) => {
  const normalizedImages = images.map((img, index) =>
    typeof img === 'string'
      ? { id: `${index}`, src: img, alt: `Image ${index + 1}` }
      : { ...img, id: img.id || `${index}`, alt: img.alt || img.title || `Image ${index + 1}` }
  );

  const displayImages = normalizedImages.slice(0, maxVisible);
  const remainingCount = Math.max(0, normalizedImages.length - maxVisible);

  return (
    <div className={`flex items-center space-x-2 ${pad ? 'p-2' : ''} ${className}`}>
      {displayImages.map((image, index) => (
        <div
          key={image.id || index}
          className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
          onClick={() => onThumbClick?.(index)}
        >
          <img
            src={image.src}
            alt={image.alt}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="w-16 h-16 rounded-lg border-2 border-white shadow-md bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default MarketingThumbnailStack;
