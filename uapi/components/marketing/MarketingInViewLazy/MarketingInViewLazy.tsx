"use client";

// A tiny utility component that renders its children only once they scroll
// into (or near) the viewport.  Until then it returns `null`, which means the
// wrapped subtree is **never mounted** and therefore none of its JavaScript
// is executed or downloaded (when using `next/dynamic`).
//
// The previous implementation depended on `framer-motion`’s `useInView` hook.
// While convenient, that pulled the entire framer-motion runtime (~35 KB
// gzipped) into the marketing page’s main bundle because this component is
// rendered above the fold.  We replace it with a minimal custom hook that uses
// the browser’s native IntersectionObserver API.  This removes framer-motion
// from the critical path; the library is still code-split into the few below-
// the-fold sections that truly read it.

import React, { useRef, useEffect, useState } from 'react';

type InViewLazyProps = {
  /** Children to render once the wrapper enters the viewport. */
  children: React.ReactNode;
  /**
   * How far outside the viewport (in CSS margin syntax) the element should be
   * considered in-view.  Using a generous positive bottom margin allows the
   * section to mount *before* it becomes visible so heavy chunks have a short
   * warm-up window.
   *
   * Default: `'2500px 0px'` – start loading when the element is within roughly
   * two-and-a-half viewports (~2,500 px) of the visible area.  This offers a
   * much more generous warm-up window so that even on exceptionally fast
   * scrolls the heavy marketing sections have time to download and execute
   * completely before they can ever become visible, fully eliminating the
   * flash-of-lazy-load that was still noticeable with the previous 1,500 px
   * margin.
   */
  margin?: string;
  /**
   * Optional CSS `contain` value to apply once the section is mounted.
   *
   * Passing `null` or `false` disables the `contain` optimisation entirely for
   * this instance – useful for elements that visually overflow their bounding
   * box (e.g. the marketing screenshot gallery that peeks above the fold).
   *
  * Default: `undefined` – containment is opt-in. While `contain: layout` can
   * improve performance, on some browsers even style containment may still
   * briefly defer rasterisation for off-screen sections, leading to flashes
   * during very fast scrolls.  Developers can explicitly pass a value (e.g.
   * `'layout'`) once a section has been verified to be safe.
   */
  contain?: string | false | null;

  /**
   * Provides an explicit intrinsic size for the wrapper so layout can be
   * calculated before the heavy subtree is mounted.  This is useful to avoid
   * Cumulative Layout Shift (CLS) caused by large, lazy-loaded sections that
   * push content down when they pop into the document flow.
   *
   * Example: `intrinsicSize="840px"` or `"840px 0"` (width height syntax).
   */
  intrinsicSize?: string;

  /**
   * When `true` the wrapped children are mounted *only* while they remain in
   * the viewport and are unmounted as soon as they scroll out.  This is handy
   * for highly interactive dashboards where reclaiming memory matters.
   *
   * Default: `false` – once mounted the children stay alive.
   */
  persist?: boolean;
};

/**
 * Tiny IntersectionObserver-based hook that returns a boolean once the target
 * element is within `rootMargin` of the viewport.
 */
function useInViewport(ref: React.RefObject<Element>, {
  rootMargin = '0px',
  once = true,
}: { rootMargin?: string; once?: boolean } = {}) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Skip the observer entirely in browsers that don’t support the API
    // (pretty much only IE11 at this point, which Next.js doesn’t target).
    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, rootMargin, once]);

  return inView;
}

export default function MarketingInViewLazy({
  children,
  // Large positive top & bottom root margins ensure the heavy subtree mounts
  // *well* before the user could ever see it.  This eliminates the brief
  // flash where the placeholder becomes visible for a split-second while the
  // dynamic chunk is still downloading, at the cost of fetching that chunk a
  // bit earlier.  We now use 2,500 px – approximately 2.5× a common laptop
  // viewport and easily three to four full viewports on modern phones.  This
  // provides a generous safety net even for users that fling-scroll quickly
  // down the page while still keeping the initial bundle lightweight.
  margin = '2500px 0px',
  // Default containment excludes `paint` to avoid a rare but visible flash
  // that can occur on some browsers when large, off-screen elements using
  // `contain: paint` rapidly enter / leave the viewport. The browser may
  // elect to skip rasterising the subtree when it deems it off-screen and
  // then needs one or two frames to paint it once it becomes visible again.
  // Dropping the `paint` keyword keeps the most impactful optimisation
  // (`contain: layout style`) while ensuring pixels are ready the moment the
  // section scrolls into view.
  contain,
  intrinsicSize,
  persist = false,
}: InViewLazyProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Keep the observer alive when `persist` is true so we can unmount the
  // subtree after it leaves the viewport.  Otherwise disconnect after the
  // first intersection for maximum efficiency.
  const isInView = useInViewport(ref, { rootMargin: margin, once: !persist });

  /*
   * When `persist === false` we want the children to stay mounted once the
   * element has entered the viewport. Track that via local state so subsequent
   * unmounts do not depend on the observer.
   */
  const [hasBeenInView, setHasBeenInView] = useState(false);
  useEffect(() => {
    if (isInView) setHasBeenInView(true);
  }, [isInView]);

  const shouldRender = persist ? isInView : isInView || hasBeenInView;

  // Build style object conditionally so we avoid spreading undefined
  const style: (React.CSSProperties & { containIntrinsicSize?: string }) = {};

  // Reserve space up-front to avoid CLS when intrinsic size is known.
  // Safari ≤17 lacks `contain-intrinsic-size` so we fall back to `min-height`.
  if (intrinsicSize) {
    const supportsCIS =
      typeof CSS !== 'undefined' &&
      typeof (CSS as any).supports === 'function' &&
      (CSS as any).supports('contain-intrinsic-size: 1px');

    if (supportsCIS) {
      (style as any).containIntrinsicSize = intrinsicSize;
    } else {
      const parts = intrinsicSize.trim().split(/\s+/);
      const heightRaw = parts.length === 2 ? parts[1] : parts[0];
      if (heightRaw && !heightRaw.startsWith('auto')) {
        style.minHeight = heightRaw as any;
      }
    }
  }

  if (shouldRender && contain) {
    style.contain = contain as any;

    /*
     * Previously we used `content-visibility: auto` to allow the browser to
     * skip painting off-screen sections for additional savings.  In practice
     * this led to visible flashes on fast scrolls because the DOM subtree was
     * present but the pixels were still withheld for a few frames after the
     * element became visible.  Switching to the default `visible` value keeps
     * painting in lock-step with the viewport while retaining the more
     * impactful layout & paint containment optimisations.  The difference in
     * rasterisation cost is negligible compared to the heavyweight dynamic
     * chunks we are already pre-loading once they are within 1,000 px.
     */
    // style.contentVisibility = 'auto' as any;
  }

  return (
    <div ref={ref} style={Object.keys(style).length ? style : undefined}>
      {shouldRender ? children : null}
    </div>
  );
}
