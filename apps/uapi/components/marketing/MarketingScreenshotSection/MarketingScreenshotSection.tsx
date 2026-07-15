"use client";

/**
 * Marketing screenshot gallery and How-it-Works shell.
 * Hero gallery, floating trios, entrance gate, and steps live in co-located modules.
 */
import React, { useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import MarketingFullScreenGallery from "@/components/marketing/MarketingFullScreenGallery/MarketingFullScreenGallery";
import type { Screenshot } from "@/components/marketing/MarketingTypes/marketing-types";
import { BITCODE_GITHUB_APP_PUBLIC_URL } from "@/lib/github-app-url";
import { useScreenshotArrow } from "./hooks/use-screenshot-arrow";
import { useScreenshotEntrance } from "./hooks/use-screenshot-entrance";
import { MarketingScreenshotMobileGrid } from "./MarketingScreenshotMobileGrid";
import { MarketingScreenshotHeroGallery } from "./MarketingScreenshotHeroGallery";
import { MarketingScreenshotHowItWorks } from "./MarketingScreenshotHowItWorks";
import type { ScreenshotHighlightGroup } from "./marketing-screenshot-data";
import "@/styles/bitcode-header-shiny-text.css";

const MarketingScreenshotSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [activeScreens, setActiveScreens] = useState<Screenshot[] | null>(null);
  const [initialSlide, setInitialSlide] = useState(0);
  const [highlightGroup, setHighlightGroup] =
    useState<ScreenshotHighlightGroup | null>(null);

  const howItWorksRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const step1Ref = useRef<HTMLDivElement>(null);
  const installRef = useRef<HTMLLIElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);
  const arrowPathRef = useRef<SVGPathElement>(null);
  const arrowHeadRef = useRef<SVGPathElement>(null);

  const { isInView, shouldAnimate, screenshotsAnimated, onEntranceComplete } =
    useScreenshotEntrance(ref);

  const openGallery = useCallback((screens: Screenshot[], index = 0) => {
    setActiveScreens(screens);
    setInitialSlide(index);
  }, []);

  const closeGallery = useCallback(() => {
    setActiveScreens(null);
  }, []);

  useScreenshotArrow({
    howItWorksRef,
    linkRef,
    step1Ref,
    installRef,
    arrowRef,
    arrowPathRef,
    arrowHeadRef,
  });

  return (
    <>
      <section
        id="screenshot"
        className="relative w-screen overflow-visible -mt-[38vh] pt-0 pb-8 tablet:pb-10 laptop:pb-12 desktop:pb-16 px-4 laptop:px-0"
        style={{ contain: "layout style" }}
      >
        <MarketingScreenshotMobileGrid />
        <motion.div
          ref={ref}
          className="relative w-screen"
          style={{
            perspective: 1000,
            transformStyle: "preserve-3d",
          }}
        >
          <MarketingScreenshotHeroGallery
            shouldAnimate={shouldAnimate}
            screenshotsAnimated={screenshotsAnimated}
            onEntranceComplete={onEntranceComplete}
          />

          {/*
           * Title / subtitle: when the screenshot entrance ran once we persist
           * that via the module-level flag so remounts render final state.
           */}
          <motion.div
            initial={
              screenshotsAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }
            }
            animate={
              screenshotsAnimated
                ? { opacity: 1, y: 0 }
                : isInView
                  ? { opacity: 1, y: 0 }
                  : {}
            }
            transition={
              screenshotsAnimated
                ? { duration: 0 }
                : { delay: 0.6, duration: 0.8 }
            }
            className="mt-16 text-center px-4 z-20"
          >
            <h2 className="text-4xl laptop:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-emerald-300 via-sky-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-[0_3px_15px_rgba(0,0,0,0.25)] pb-2 laptop:pb-3">
              <span className="block">Powerful Bitcode Workflows</span>
              <span className="block">That Adapt To Your Stack</span>
            </h2>
            <div className="mt-6 max-w-4xl mx-auto leading-relaxed px-4 overflow-hidden">
              <p
                className="text-xl laptop:text-2xl text-center text-slate-300"
                style={{ whiteSpace: "normal" }}
              >
                The{" "}
                <a
                  ref={linkRef}
                  id="esi-link"
                  href={BITCODE_GITHUB_APP_PUBLIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glowing-underline text-slate-100 hover:text-white transition-colors font-semibold"
                >
                  Bitcode&nbsp;GitHub&nbsp;App
                </a>{" "}
                lets you turn repository context into PR-backed AssetPacks with
                reviewable evidence and connected-interface delivery.
              </p>
            </div>

            <MarketingScreenshotHowItWorks
              howItWorksRef={howItWorksRef}
              step1Ref={step1Ref}
              installRef={installRef}
              arrowRef={arrowRef}
              arrowPathRef={arrowPathRef}
              arrowHeadRef={arrowHeadRef}
              highlightGroup={highlightGroup}
              setHighlightGroup={setHighlightGroup}
              openGallery={openGallery}
            />
          </motion.div>
        </motion.div>
      </section>
      {activeScreens && (
        <MarketingFullScreenGallery
          screenshots={activeScreens}
          isOpen={Boolean(activeScreens)}
          initialIndex={initialSlide}
          onClose={closeGallery}
        />
      )}
    </>
  );
};

export default MarketingScreenshotSection;
