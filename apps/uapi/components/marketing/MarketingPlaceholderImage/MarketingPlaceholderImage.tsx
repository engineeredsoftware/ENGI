"use client";

import React from 'react';

export interface PlaceholderImageProps {
  src?: string;
  alt?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  onClick?: () => void;
  type?: string;
  category?: string;
  text?: string;
  stretch?: boolean;
}

const MarketingPlaceholderImage: React.FC<PlaceholderImageProps> = ({
  src,
  alt = 'Placeholder image',
  className = '',
  width = '100%',
  height = 'auto',
  onClick,
  type,
  category,
  text,
  stretch = false,
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default', objectFit: stretch ? 'cover' : undefined }}
      />
    );
  }

  return (
    <div
      className={`bg-gray-200 flex items-center justify-center ${className}`}
      style={{
        width,
        height: height === 'auto' ? '200px' : height,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div className="text-gray-500 text-center">
        <div className="text-4xl mb-2">📷</div>
        <div className="text-sm">{text || alt}</div>
        {(type || category) && (
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-gray-400">
            {[type, category].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingPlaceholderImage;
