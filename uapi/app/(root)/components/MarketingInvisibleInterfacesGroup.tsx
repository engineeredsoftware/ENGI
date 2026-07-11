"use client";

/*
 * InvisibleInterfacesGroup – lightweight wrapper that visually groups the
 * Marketplace and BTD share metrics marketing sections under the umbrella label
 * “Invisible Interfaces”.
 *
 * The component purposely contains **zero business logic** – it only adds a
 * decorative container with subtle side/bottom borders, a soft-light radial
 * glow and a capsule-style heading.  All heavy lifting (live order book,
 * share-readiness presentation, etc.) stays inside its children.
 *
 * Usage:
 *   <InvisibleInterfacesGroup>
 *     <MarketplaceSection />
 *     <BtdShareMetricsSection />
 *   </InvisibleInterfacesGroup>
 */

import React from "react";
import styles from './marketing-invisible-interfaces-group.module.css';
import { NavProcessingIndicator } from "@/components/bitcode/indicators/NavProcessingIndicator";

/*
 * Border animation: we craft a single CSS class that uses four gradient
 * backgrounds (top, bottom, left, right) with a shifting background-position
 * to create a perpetual clockwise sweep of a subtle highlight around the
 * frame.  This is only ~200 bytes of generated CSS and avoids JS timers.
 */

interface Props {
  children: React.ReactNode;
}

export default function MarketingInvisibleInterfacesGroup({ children }: Props) {
  // File-local classes for clarity and reuse
  const containerClass = `relative isolate overflow-visible invisible-interfaces-container ${styles.container}`;
  const headerClass = 'relative tablet:absolute tablet:left-10 tablet:top-0 tablet:-translate-y-1/2 z-30 flex flex-col gap-3 px-5 tablet:px-10 py-5 rounded-xl backdrop-blur-2xl overflow-visible w-full tablet:w-max text-center tablet:text-left mx-auto';
  const innerClass = `flex flex-col rounded-[inherit] overflow-hidden invisible-interfaces-inner ${styles.inner}`;
  return (
    <section
      aria-labelledby="invisible-interfaces-heading"
      className={containerClass}
      style={{
        /* Slightly thicker border for a more pronounced frame */
        border: '4px solid transparent',
        borderRadius: '1.25rem',
        /* Dual-layer gradient: outer animated ring + fully transparent interior */
        background:
          'linear-gradient(#0000,#0000) padding-box, linear-gradient(90deg,#10ffd3,#ff9d4a) border-box',
        /* Dramatic inner glow so we can easily see the effect – feel free to dial
         * this back once confirmed working. */
        boxShadow:
          'inset 0 0 20px 8px rgba(16,255,211,0.45), inset 0 0 40px 16px rgba(255,157,74,0.4)',
      }}
    >
      {/* Border directly on the wrapper via CSS variables; keeps interior fully transparent */}
      {/* Label */}
      {/* Label card */}
      <header
        id="invisible-interfaces-heading"
        className={headerClass}
        style={{
          /* Layered backgrounds: subtle teal/amber corner glows atop dark glass */
          background:
            'radial-gradient(circle at 0% 0%, rgba(16,255,211,0.16) 0%, rgba(16,255,211,0) 45%),' +
            'radial-gradient(circle at 100% 100%, rgba(255,157,74,0.18) 0%, rgba(255,157,74,0) 45%),' +
            'rgba(12,18,35,0.90)',
          /* Depth + slight inner highlight */
          boxShadow:
            '0 10px 28px rgba(0,0,0,0.45),' +
            'inset 0 1px 2px rgba(255,255,255,0.05),' +
            'inset 0 0 14px 3px rgba(16,255,211,0.14),' +
            'inset 0 0 28px 5px rgba(255,157,74,0.10)',
        }}
      >
        {/* Optional orbital icon to add subtle motion */}
        <div className="flex items-center space-x-4">
          <NavProcessingIndicator className="hidden laptop:block scale-150" />
          <h2 className={`text-xl laptop:text-3xl font-extrabold tracking-tight text-transparent leading-snug whitespace-nowrap ${styles.headingTitle}`}>
            Invisible Intelligence
          </h2>
        </div>
        <p className={`text-sm laptop:text-lg leading-tight max-w-md text-gray-200 ${styles.subtitle}`}>
          Advanced AI-only interfaces include virtual hardware workstations, technical knowledge trading, and more that improve capabilities at the frontier and in the field.
        </p>
      </header>

      {/* Inset glow overlay – separate layer to ensure glow is visible even if
          child sections cover the parent background.  Positioned *after* the
          header so the label stays on top. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-500"
        style={{
          /* Epic teal–amber halo (reinstated) */
          boxShadow:
            'inset 0 0 40px 8px rgba(16,255,211,0.55), inset 0 0 80px 16px rgba(255,157,74,0.52)',
        }}
      />

      {/* Child sections – clipped to rounded frame */}
      <div className={innerClass}>
        {children}
      </div>
    </section>
  );
}
