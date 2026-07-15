
import { cn } from "@bitcode/styling";

import React, { FC, CSSProperties } from "react";

/* ---------------------------------------------------------------------
 * Static colour mapping using design tokens. Lives outside the component 
 * for memory optimization - created once and shared across renders.
 * ------------------------------------------------------------------- */
const VARIANT_COLOURS: Record<'green' | 'purple' | 'orange', { shimmerColor: string; background: string }> = {
  green: {
    shimmerColor: 'theme(colors.brand.emerald)', // Design token
    background: 'theme(colors.brand.emerald)',
  },
  purple: {
    shimmerColor: 'theme(colors.brand.purple)', // Design token  
    background: 'theme(colors.brand.purple)',
  },
  orange: {
    shimmerColor: 'theme(colors.brand.orange)', // Design token
    background: 'theme(colors.brand.orange)',
  },
} as const;

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Hex / RGB color used for the conic-gradient shimmer trail.
   * Overwrites any color set by `variant`.
   */
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  /**
   * Solid background color behind the button. Overwrites any color set by
   * `variant`.
   */
  background?: string;
  /**
   * Pre-configured color themes that automatically set `shimmerColor` and
   * `background` so callers don’t have to repeat hex strings everywhere.
   */
  variant?: 'green' | 'purple' | 'orange';
  className?: string;
  innerClassName?: string;
  children?: React.ReactNode;
  large?: boolean;
  medium?: boolean;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor,
      shimmerSize = "0.1em",
      shimmerDuration = "3s",
      borderRadius = "4px",
      background,
      variant,
      className,
      children,
      style,
      ...props
    },
    ref,
  ) => {
    // Determine if button is disabled
    const isDisabled = props.disabled;

    // Resolve final colors using design tokens: explicit prop -> variant -> fallback default
    const finalShimmerColor = shimmerColor ?? (variant ? VARIANT_COLOURS[variant].shimmerColor : 'theme(colors.brand.emerald-soft)');
    const finalBackground = background ?? (variant ? VARIANT_COLOURS[variant].background : 'theme(colors.brand.cosmic)');
    return (
      <button
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": finalShimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": finalBackground,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            ...style,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/10 px-6 py-3 text-white [border-radius:var(--radius)] dark:text-black",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-[1px]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container (disabled buttons do not animate) */}
        {!isDisabled && (
          <div
            className={cn(
              "-z-30 blur-[2px] will-change-transform", // promoted to its own GPU layer
              "absolute inset-0 overflow-visible [container-type:size]",
            )}
          >
            {/* spark */}
            <div className="absolute inset-0 h-[100cqh] animate-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
              {/* spark before */}
              <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
            </div>
          </div>
        )}
        {children}

        {/* Highlight */}
        <div
          className={cn(
            "inset-0 absolute h-full w-full",

            "rounded-md px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#ffffff1f]",

            // transition
            "transform-gpu transition-all duration-300 ease-in-out",

            // on hover
            // NOTE: inner shadow colour should follow the chosen variant.
            // We choose from a small, finite set of **literal** class names so
            // that Tailwind can still pick them up at build-time while letting
            // us decide which one to use at run-time.
            (
              variant === 'purple'
                ? 'group-hover:shadow-[inset_0_-6px_10px_theme(colors.brand.purple-glow)]'
                : variant === 'orange'
                ? 'group-hover:shadow-[inset_0_-6px_10px_theme(colors.brand.orange-glow)]'
                : 'group-hover:shadow-[inset_0_-6px_10px_theme(colors.brand.emerald-glow)]'
            ),

            // on click
            "group-active:shadow-[inset_0_-10px_10px_#ffffff3f]",
          )}
        />

        {/* backdrop */}
        <div
          className={cn(
            "absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]",
          )}
        />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButtonBase";

const ShimmerButtonDemoBase: FC<ShimmerButtonProps> = ({
  children,
  large = false,
  medium = false,
  className = '',
  innerClassName = '',
  ...rest
}) => {
  return (
    <ShimmerButton className={cn("shadow-2xl", className)} {...rest}>
      <span className={cn(
        'whitespace-pre-wrap text-center',
        innerClassName || 'font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 text-lg',
        { 'text-2xl tracking-normal': large && !innerClassName, 'text-xl': medium && !innerClassName }
      )}>
        {children}
      </span>
    </ShimmerButton>
  );
}

ShimmerButtonDemoBase.displayName = "ShimmerButton";

// Avoid unnecessary re-renders by wrapping in React.memo – the button is
// generally static except for occasional hover/focus state managed by the
// browser, not React.
const ShimmerButtonDemo = React.memo(ShimmerButtonDemoBase);

export default ShimmerButtonDemo;
