/**
 * Entrance animation gate for the marketing screenshot hero gallery.
 * Couples the hero `revealScreenshots` event with viewport intersection
 * and a module-level flag so the grand entrance plays at most once per load.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

declare global {
  interface Window {
    __bitcodeRevealScreenshotsFired?: boolean;
  }
}

/** Module-level: animation only ever plays once per page load. */
let screenshotsAnimated = false;

export function getScreenshotsAnimated(): boolean {
  return screenshotsAnimated;
}

export function markScreenshotsAnimated(): void {
  screenshotsAnimated = true;
}

export function useScreenshotEntrance(sectionRef: React.RefObject<HTMLElement | null>) {
  const isInView = useInView(sectionRef, { once: true, margin: "0px 0px -75% 0px" });
  const [canAnimate, setCanAnimate] = useState(screenshotsAnimated);
  const entranceDoneRef = useRef(screenshotsAnimated);

  useEffect(() => {
    if (typeof window !== "undefined" && window.__bitcodeRevealScreenshotsFired) {
      setCanAnimate(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setCanAnimate(true);
    window.addEventListener("revealScreenshots", handler);
    return () => window.removeEventListener("revealScreenshots", handler);
  }, []);

  const shouldAnimate = !screenshotsAnimated && canAnimate && isInView;

  const onEntranceComplete = useCallback(() => {
    if (!shouldAnimate || entranceDoneRef.current) return;
    entranceDoneRef.current = true;
    screenshotsAnimated = true;
    window.dispatchEvent(new CustomEvent("screenshotEntranceComplete"));
  }, [shouldAnimate]);

  return {
    isInView,
    shouldAnimate,
    screenshotsAnimated,
    onEntranceComplete,
  };
}
