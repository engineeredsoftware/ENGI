"use client";

// Simplified placeholder for the previous ScrollDown indicator.  While the
// design is temporarily removed, we still expose the same interface so that
// parent components compile and any `onEntranceComplete` callbacks continue to
// fire, avoiding dead-locks in the landing page sequence.

import { useEffect } from 'react';

interface ScrollDownProps {
  targetId?: string;
  className?: string;
  disabled?: boolean;
  onEntranceComplete?: () => void;
}

export default function MarketingScrollDown({ onEntranceComplete }: ScrollDownProps) {
  // Immediately notify listeners that the (now-removed) entrance animation has
  // "completed" so nothing waits on it.
  useEffect(() => {
    onEntranceComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render nothing – the indicator is hidden until the redesign returns.
  return null;
}
