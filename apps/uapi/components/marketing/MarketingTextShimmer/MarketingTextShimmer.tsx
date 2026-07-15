
import { cn } from '@bitcode/styling';
import { ArrowRightIcon } from "@radix-ui/react-icons";
import React, { CSSProperties, FC, ReactNode } from 'react';

export interface MarketingTextShimmerProps {
  children: ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export const MarketingTextShimmer: FC<MarketingTextShimmerProps> = ({
  children,
  className,
  shimmerWidth = 100,
}) => {
  return (
    <p
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
          contain: 'paint'
        } as CSSProperties
      }
      className={cn(
        "mx-auto max-w-md text-neutral-900/50 dark:text-neutral-200",

        // Shimmer effect
        "animate-shimmer bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",

        // Shimmer gradient
        "bg-gradient-to-r from-neutral-100 via-black/80 via-50% to-neutral-100 dark:from-neutral-900 dark:via-white/80 dark:to-neutral-900",

        className,
      )}
    >
      {children}
    </p>
  );
};

const MarketingTextShimmerDemo: FC<MarketingTextShimmerProps> = ({
  children,
  className
}) => {
  return (
    <div
      className={cn(
        "group rounded-full border border-black/5 text-base text-white text-sm transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:bg-opacity-35 dark:hover:bg-opacity-50",
        className
      )}
    >
      <MarketingTextShimmer className="inline-flex items-center justify-center px-4 py-1">
        <span className="">{children}</span>
        <ArrowRightIcon className="size-4 ml-1 text-green-primary transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
      </MarketingTextShimmer>
    </div>
  );
};

export default MarketingTextShimmerDemo;
