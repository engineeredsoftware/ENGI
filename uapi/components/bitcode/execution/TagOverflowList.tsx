"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { PathPill, type PillType } from './PathPill';

interface TagInfo {
  type: PillType;
  label: any;
}

interface TagOverflowListProps {
  /**
   * Tags to display – order matters.
   */
  tags: TagInfo[];

  /**
   * Percentage (0-1) of the parent width we allow the tag list to occupy.
   * Defaults to 0.8 (= 80%).
   */
  maxWidthRatio?: number;

  /** Optional extra classes for the container */
  className?: string;
}

// A lightweight component that attempts to render as many PathPills as will fit
// within `maxWidthRatio` of its own width. Anything that would overflow is
// collapsed into a "+N" indicator.
export function TagOverflowList({
  tags,
  maxWidthRatio = 0.8,
  className = '',
}: TagOverflowListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(tags.length);

  // Recalculate on mount & whenever the window resizes.
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => recalc();
    window.addEventListener('resize', handleResize);
    recalc();
    return () => window.removeEventListener('resize', handleResize);
  }, [tags]);

  const recalc = () => {
    const container = containerRef.current;
    if (!container) return;

    const available = container.offsetWidth * maxWidthRatio;

    // Children might not yet be rendered. Temporarily render all, measure, then
    // update state in the next tick.
    const pillWidths: number[] = [];
    const tempChildren = Array.from(container.children) as HTMLElement[];
    for (const child of tempChildren) {
      pillWidths.push(child.offsetWidth);
    }

    if (pillWidths.length === 0) {
      setVisibleCount(0);
      return;
    }

    // Width for the "+N" indicator (approx). We'll refine after initial calc by
    // measuring the actual element.
    const PLUS_PILL_ESTIMATE = 28; // px

    let used = 0;
    let count = 0;
    for (let i = 0; i < pillWidths.length; i++) {
      const width = pillWidths[i];
      const remainingNeeded = i < pillWidths.length - 1 ? PLUS_PILL_ESTIMATE : 0;
      if (used + width + remainingNeeded > available) {
        break;
      }
      used += width;
      count++;
    }

    setVisibleCount(count);
  };

  // Re-run once after first calculation to account for the actual +N element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = window.requestAnimationFrame(recalc);
    return () => window.cancelAnimationFrame(id);
  }, [visibleCount]);

  const hiddenCount = tags.length - visibleCount;

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center flex-nowrap whitespace-nowrap overflow-hidden gap-1 ${className}`}
    >
      {tags.slice(0, visibleCount).map((tag, idx) => (
        <PathPill key={idx} type={tag.type} label={tag.label} />
      ))}

      {hiddenCount > 0 && (
        <span
          className="inline-flex items-center px-1.5 py-0.5 bg-gray-600/20 text-[10px] leading-none text-gray-300"
          title={tags
            .slice(visibleCount)
            .map((t) => (typeof t.label === 'string' ? t.label : String(t.label)))
            .join(' • ')}
        >
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}
