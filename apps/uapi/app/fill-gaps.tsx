import React from 'react';

import { cn } from '@bitcode/styling';
import GridPattern from "@/components/bitcode/magicui/GridPattern/GridPattern";
import RevealingSoonOverlay from "@/components/bitcode/overlays/RevealingSoonOverlay/RevealingSoonOverlay";

import { ChevronRight } from "lucide-react";

const baseShadow = '[text-shadow:_0_0_8px_rgba(255,255,255,0.66)]';

// Client helper that synchronises the banner height to a CSS variable so the
// rest of the layout can offset accordingly.  Extracted so the main banner
// component can remain a Server Component and therefore render together with
// the overlay during the initial HTML stream.
// ---------------------------------------------------------------------------
// Using a tiny client sub-component avoids delaying the visual overlay until
// after hydration – the root cause of the earlier flash.

import MarketingBannerHeightSync from '@/components/marketing/MarketingBannerHeightSync/MarketingBannerHeightSync';

interface ReadLightpaperProps {
  reavealingSoon?: boolean;
}

export default function ReadLightpaper({ reavealingSoon = false }: ReadLightpaperProps) {
  const squares: [number, number][] = [
    [0, 2],
    [2, 3],
    [6, 2],
    [9, 3],
    [5, 7],
    [11, 1],
    [18, 3],
    [27, 1],
    [31, 2],
    [35, 0],
    [36, 1],
  ];

  return (
    <div
      id="lightpaper-banner"
      className="absolute top-0 left-0 flex w-full items-center justify-center overflow-hidden py-4 px-4 tablet:px-8 laptop:pl-48 laptop:pr-24"
      style={{ zIndex: 999, backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Keep rest of layout informed about banner height */}
      <MarketingBannerHeightSync targetId="lightpaper-banner" />

      {/* Render overlay first so it is included in the streamed HTML */}
      {reavealingSoon && (
        <RevealingSoonOverlay
          stretch
          subtle
          rightAlign
          fadeLeft
          alwaysShowText
          deferParticles
          blockInteraction
        />
      )}

      {/* Subtle bottom fade */}
      <div className="absolute w-full inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" style={{ boxShadow: 'inset 0 -2px 8px -2px rgba(255, 255, 255, 0.04)' }} />

      {/* Content */}
      <div className="w-full max-w-7xl flex flex-col tablet:flex-row items-center justify-between relative z-10 gap-4 px-2 tablet:px-4">
        {/* CTA */}
        <a href="/lightpaper" className="group relative inline-flex items-center cursor-pointer">
          <span className="relative inline-block">
            <span className="relative z-10 bitcode-text text-sm desktop:text-base tracking-wide leading-6">Read&nbsp;Blog&nbsp;Post</span>
            <span className="absolute left-0 top-0 z-0 bitcode-text-glow text-sm desktop:text-base tracking-wide leading-6">Read&nbsp;Blog&nbsp;Post</span>
          </span>
          <ChevronRight className="ml-1 size-3 desktop:size-4 transition-all duration-300 ease-out group-hover:translate-x-1 [filter:drop-shadow(0_0_5px_rgba(101,254,183,0.5))]" />
        </a>

        {/* Headline */}
        <div className="flex-grow text-center laptop:text-left">
          <span className={`font-light tracking-wide text-green-primary ${baseShadow}`}>
            <span className="font-medium text-xl desktop:text-2xl whitespace-normal laptop:whitespace-nowrap flex items-baseline justify-center laptop:justify-start">
              <span className="text-gray-300/60 font-serif text-3xl desktop:text-4xl mr-1 leading-none">"</span>
              Incentivizing&nbsp;Measured&nbsp;Technical&nbsp;Knowledge&nbsp;Exchange
              <span className="text-gray-300/60 font-serif text-3xl desktop:text-4xl ml-1 leading-none">"</span>
            </span>
          </span>
        </div>

        {/* X link */}
        <a
          href="https://github.com/engineeredsoftware/bitcode"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center text-gray-500 hover:text-green-primary transition-colors"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 24 24"
            className="size-5 laptop:size-6 group-hover:scale-110 transition-transform [filter:drop-shadow(0_0_4px_rgba(101,254,183,0.55))]"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.2c0 4.42 2.87 8.16 6.84 9.49.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.2-3.37-1.2-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.36 1.11 2.94.85.09-.67.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.32.1-2.74 0 0 .84-.27 2.75 1.05A9.33 9.33 0 0 1 12 6.84c.85 0 1.71.12 2.51.36 1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.48.1 2.74.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.8-4.59 5.05.36.32.68.95.68 1.92 0 1.39-.01 2.51-.01 2.85 0 .27.18.6.69.49A10.21 10.21 0 0 0 22 12.2C22 6.58 17.52 2 12 2Z" />
          </svg>
          <span className="sr-only">Bitcode on GitHub</span>
        </a>
      </div>

      {/* Decorative grid */}
      <GridPattern
        squares={squares}
        className={cn(
          '[mask-image:radial-gradient(2000px_circle_at_center,white,transparent)]',
          'skew-y-3 w-[222%] h-[222%]',
          'opacity-[70%]',
          'fill-transparent stroke-gray-400/25'
        )}
      />
    </div>
  );
}
